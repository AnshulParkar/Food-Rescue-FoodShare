import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { campaignService } from '@/services/campaignService';

// Form schema validation
const formSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: 'Title must be at least 5 characters.',
    })
    .max(100, {
      message: 'Title must not be longer than 100 characters.',
    }),
  description: z
    .string()
    .min(10, {
      message: 'Description must be at least 10 characters.',
    })
    .max(1000, {
      message: 'Description must not be longer than 1000 characters.',
    }),
  targetQuantity: z
    .number()
    .min(1, {
      message: 'Quantity must be at least 1.',
    })
    .max(10000, {
      message: 'Quantity must not be more than 10,000.',
    }),
  foodType: z
    .string()
    .min(3, {
      message: 'Food type must be at least 3 characters.',
    })
    .max(50, {
      message: 'Food type must not be longer than 50 characters.',
    }),
  location: z
    .string()
    .min(5, {
      message: 'Location must be at least 5 characters.',
    }),
  endDate: z.date({
    required_error: 'End date is required.',
  }),
  imageUrl: z
    .string()
    .url({
      message: 'Please enter a valid URL for the image.',
    })
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

const CreateCampaignPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default form values
  const defaultValues: Partial<FormValues> = {
    title: '',
    description: '',
    targetQuantity: 10,
    foodType: 'Water(Tons)',
    location: '',
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days in the future
    imageUrl: 'https://images.unsplash.com/photo-1583866598261-2784c437df38?q=80&w=2070',
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (!currentUser) {
        toast.error('You must be logged in to create a campaign');
        navigate('/signin');
        return;
      }

      if (currentUser.role !== 'recipient') {
        toast.error('Only recipients can create campaigns');
        return;
      }

      setIsSubmitting(true);

      const campaignData = {
        ...data,
        recipientId: currentUser.id,
        recipientName: currentUser.name,
        currentQuantity: 0,
        status: 'active' as const,
        // Use default image if none provided
        imageUrl: data.imageUrl || defaultValues.imageUrl,
      };

      await campaignService.createCampaign(campaignData);
      
      toast.success('Campaign created successfully!');
      navigate('/dashboard/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate back
  const goBack = () => {
    navigate(-1);
  };

  // If not a recipient, redirect
  if (currentUser && currentUser.role !== 'recipient') {
    toast.error('Only recipients can create campaigns');
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button variant="ghost" onClick={goBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
          <p className="text-gray-500 mb-8">
            Create a campaign to request food donations from donors
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Water for Rural School Children"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the campaign purpose, need, and impact..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="targetQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={e => {
                            const value = parseInt(e.target.value);
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="foodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Type</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Water(Tons), Rice(kg), Meal Kits" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Chennai, India"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-foodshare-500 hover:bg-foodshare-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignPage; 