import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { campaignService } from '@/services/campaignService';
import { toast } from 'sonner';

// Campaign interface matching our backend model
interface Campaign {
  _id: string;
  title: string;
  description: string;
  recipientId: string;
  recipientName: string;
  targetQuantity: number;
  currentQuantity: number;
  foodType: string;
  location: string;
  status: 'active' | 'completed' | 'cancelled';
  endDate: string;
  imageUrl?: string;
}

const CampaignDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationQuantity, setDonationQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      if (!id) return;
      
      try {
        const campaignData = await campaignService.getCampaignById(id);
        setCampaign(campaignData);
      } catch (error) {
        console.error('Error fetching campaign details:', error);
        toast.error('Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [id]);

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDonate = async () => {
    if (!currentUser) {
      toast.error('Please sign in to donate');
      navigate('/signin');
      return;
    }

    if (!campaign) return;

    if (currentUser.role !== 'donor') {
      toast.error('Only donors can make donations');
      return;
    }

    if (donationQuantity <= 0) {
      toast.error('Please enter a valid donation quantity');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit the donation
      await campaignService.donateToCampaign({
        campaignId: campaign._id,
        donorId: currentUser.id,
        quantity: donationQuantity,
        foodType: campaign.foodType,
        status: 'pending',
        recipientId: campaign.recipientId
      });

      // Update local campaign data to reflect new donation
      setCampaign({
        ...campaign,
        currentQuantity: campaign.currentQuantity + donationQuantity
      });

      // Close the dialog and show success message
      setDialogOpen(false);
      toast.success('Thank you for your donation!');
    } catch (error) {
      console.error('Error making donation:', error);
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  // Handle donation quantity input
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setDonationQuantity(isNaN(value) ? 0 : value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Button variant="ghost" onClick={goBack} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            
            <Skeleton className="h-72 w-full mb-8 rounded-lg" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
            
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5 mb-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Button variant="ghost" onClick={goBack} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <Alert variant="destructive" className="max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Campaign not found</AlertTitle>
            <AlertDescription>
              The campaign you're looking for could not be found. It may have been removed or the URL is incorrect.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(campaign.currentQuantity, campaign.targetQuantity);
  const isCampaignActive = campaign.status === 'active';
  const isOwner = currentUser && currentUser.id === campaign.recipientId;
  const isDonor = currentUser && currentUser.role === 'donor';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button variant="ghost" onClick={goBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">{campaign.title}</h1>
              <p className="text-gray-500 mt-1">
                Campaign by {campaign.recipientName}
              </p>
            </div>
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </Badge>
          </div>
          
          {/* Campaign Image */}
          <div 
            className="w-full h-72 bg-cover bg-center rounded-lg mb-8" 
            style={{ 
              backgroundImage: `url(${campaign.imageUrl || 'https://images.unsplash.com/photo-1583866598261-2784c437df38?q=80&w=2070'})` 
            }}
          />
          
          {/* Progress and Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">
                  {campaign.currentQuantity} of {campaign.targetQuantity} {campaign.foodType}
                </span>
                <span>{progress}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-gray-500" />
                <span>{campaign.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-gray-500" />
                <span>Ends {formatDate(campaign.endDate)}</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-gray-500" />
                <span>Organized by {campaign.recipientName}</span>
              </div>
            </div>
          </div>
          
          {/* Campaign Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">About This Campaign</h2>
            <div className="space-y-3 whitespace-pre-line">
              {campaign.description}
            </div>
          </div>
          
          {/* Donation Button */}
          {isDonor && isCampaignActive && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-foodshare-500 hover:bg-foodshare-600 text-white py-6 text-lg">
                  Donate to This Campaign
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Make a Donation</DialogTitle>
                  <DialogDescription>
                    Enter the quantity of {campaign.foodType} you wish to donate to this campaign.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <Label htmlFor="quantity" className="block mb-2">
                    Donation Quantity ({campaign.foodType})
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={donationQuantity}
                    onChange={handleQuantityChange}
                  />
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleDonate} 
                    disabled={isSubmitting}
                    className="bg-foodshare-500 hover:bg-foodshare-600 text-white"
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Donation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Campaign Ended Alert */}
          {!isCampaignActive && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Campaign {campaign.status}</AlertTitle>
              <AlertDescription>
                This campaign is no longer accepting donations.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Campaign Management for Owner */}
          {isOwner && (
            <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Campaign Management</h2>
              <div className="flex gap-4">
                <Button variant="outline">Edit Campaign</Button>
                {isCampaignActive ? (
                  <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-50">
                    Cancel Campaign
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Campaign Ended
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails; 