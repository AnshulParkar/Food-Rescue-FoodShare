import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ShelfLifeValidator, { ValidationResult } from "./ShelfLifeValidator";
import { Separator } from "@/components/ui/separator";
import MapPopup from "./MapPopup";
import ImageUpload from './ImageUpload';
import { zodResolver } from "@hookform/resolvers/zod";
import { donationFormSchema } from "@/lib/validations/donation";

interface DonationFormProps {
  onSubmit: (data: DonationFormValues) => void;
}

export interface DonationFormValues {
  title: string;
  description: string;
  foodType: string;
  quantity: string;
  location: string;
  expiry: Date;
  imageUrl: string;
  validationResult?: ValidationResult;
}

const foodTypes = [
  "Prepared Meals",
  "Fresh Produce",
  "Canned Goods",
  "Bread & Baked",
  "Dairy",
  "Meat & Protein",
  "Dry Goods",
  "Beverages",
  "Mixed Items",
];

const quantityOptions = [
  "Small (1-3 meals)",
  "Medium (4-10 meals)",
  "Large (11-25 meals)",
  "Extra Large (25+ meals)",
];

// Placeholder image URLs
const foodImageOptions = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1593759608142-e08b84568198?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-4FujjkcI40g?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
];

const DonationForm = ({ onSubmit }: DonationFormProps) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationCompleted, setValidationCompleted] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  const handleLocationSelect = (lat: number, lng: number) => {
    const locationString = `Lat: ${lat}, Lng: ${lng}`;
    setSelectedLocation(locationString);
    setMapOpen(false);
    form.setValue("location", locationString);
  };

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      expiry: new Date(),
      quantity: '',
      foodType: '',
      imageUrl: '',
    },
  });

  // Update form expiry date when validation suggests a new expiry
  useEffect(() => {
    if (validationResult?.suggestedExpiry) {
      form.setValue("expiry", validationResult.suggestedExpiry);
    }
  }, [validationResult, form]);

  const handleValidationComplete = (result: ValidationResult) => {
    setValidationResult(result);
    setValidationCompleted(true);
  };

  const handleFormSubmit = (data: DonationFormValues) => {
    // Check if validation has been completed
    if (!validationCompleted) {
      toast.error("Please validate your food item before submitting");
      return;
    }

    // Check if validation failed
    if (validationResult && !validationResult.isValid) {
      toast.error(
        "Cannot list expired or unsafe food. Please upload a different item."
      );
      return;
    }

    // Add the selected image URL and validation result to the form data
    data.imageUrl = selectedImage;
    data.validationResult = validationResult || undefined;

    // Pass the form data to the parent component
    onSubmit(data);

    // Reset the form
    form.reset();
    setSelectedImage('');
    setValidationResult(null);
    setValidationCompleted(false);

    // Show a success toast
    toast.success("Donation listed successfully!");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 animate-fade-up"
      >
        <div className="space-y-6">
          <ShelfLifeValidator onValidationComplete={handleValidationComplete} />

          <Separator className="my-6" />

          <FormField
            control={form.control}
            name="title"
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="E.g., Fresh sandwich platter"
                    {...field}
                    className="focus-visible:ring-foodshare-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the food items, quantity, and any storage requirements"
                    className="resize-none focus-visible:ring-foodshare-500"
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
              name="foodType"
              rules={{ required: "Food type is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="focus:ring-foodshare-500">
                        <SelectValue placeholder="Select food type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {foodTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              rules={{ required: "Quantity is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approximate Quantity</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="focus:ring-foodshare-500">
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {quantityOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* <FormField
            control={form.control}
            name="location"
            rules={{ required: "Pickup location is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <FormControl>
                  <Input placeholder="Address or landmark" {...field} className="focus-visible:ring-foodshare-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="location"
            rules={{ required: "Location is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      value={selectedLocation || ""}
                      placeholder="Select location from map"
                      readOnly
                      className="pr-10 focus-visible:ring-foodshare-500 cursor-pointer"
                      onClick={() => setMapOpen(true)}
                    />
                    <MapPin
                      className="absolute right-3 top-2.5 text-foodshare-500 cursor-pointer"
                      onClick={() => setMapOpen(true)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {mapOpen && (
            <MapPopup
              onSelectLocation={handleLocationSelect} // Now correctly expecting two arguments
              onClose={() => setMapOpen(false)}
            />
          )}
          <FormField
            control={form.control}
            name="expiry"
            rules={{ required: "Expiry date is required" }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date</FormLabel>
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
                {validationResult?.suggestedExpiry && (
                  <p className="text-xs text-foodshare-600 mt-1">
                    Suggested expiry based on image analysis
                  </p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Food Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    onImageSelect={(url) => {
                      setSelectedImage(url);
                      field.onChange(url);
                    }}
                    currentImageUrl={selectedImage}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-foodshare-500 hover:bg-foodshare-600 text-white"
          disabled={
            !validationCompleted ||
            (validationResult && !validationResult.isValid)
          }
        >
          {!validationCompleted
            ? "Validate Food First"
            : validationResult && !validationResult.isValid
            ? "Cannot List Expired Food"
            : "List Donation"}
        </Button>

        {!validationCompleted && (
          <p className="text-xs text-center text-muted-foreground">
            Please validate your food item by uploading an image before listing
          </p>
        )}
      </form>
    </Form>
  );
};

export default DonationForm;