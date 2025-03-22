import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { campaignService } from '@/services/campaignService';
import { toast } from 'sonner';

// Campaign interface 
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

const CampaignTab = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Only show active campaigns in the community tab
        const allCampaigns = await campaignService.getAllCampaigns();
        const activeCampaigns = allCampaigns.filter(campaign => campaign.status === 'active');
        setCampaigns(activeCampaigns);
        setFilteredCampaigns(activeCampaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        toast.error('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Apply search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCampaigns(campaigns);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = campaigns.filter(
      campaign =>
        campaign.title.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query) ||
        campaign.location.toLowerCase().includes(query) ||
        campaign.foodType.toLowerCase().includes(query) ||
        campaign.recipientName.toLowerCase().includes(query)
    );
    
    setFilteredCampaigns(results);
  }, [searchQuery, campaigns]);

  const handleViewCampaign = (id: string) => {
    navigate(`/campaigns/${id}`);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search campaigns..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {currentUser?.role === 'recipient' && (
          <Button 
            onClick={() => navigate('/campaigns/create')}
            className="bg-foodshare-500 hover:bg-foodshare-600 text-white"
          >
            Create Campaign
          </Button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && filteredCampaigns.length === 0 && (
        <Alert className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 my-8">
          <AlertDescription className="text-center py-8">
            {searchQuery ? (
              <>
                No campaigns match your search criteria.
                <Button variant="link" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              </>
            ) : (
              'No active campaigns are currently available.'
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Campaign cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card 
            key={campaign._id} 
            className="overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ 
                backgroundImage: `url(${campaign.imageUrl || 'https://images.unsplash.com/photo-1583866598261-2784c437df38?q=80&w=2070'})` 
              }}
            />
            <CardContent className="p-4">
              <div className="mb-2">
                <h3 className="font-semibold text-lg line-clamp-1">{campaign.title}</h3>
                <p className="text-sm text-gray-500">Organized by {campaign.recipientName}</p>
              </div>
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{campaign.description}</p>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>{campaign.currentQuantity} of {campaign.targetQuantity} {campaign.foodType}</span>
                  <span>{calculateProgress(campaign.currentQuantity, campaign.targetQuantity)}%</span>
                </div>
                <Progress value={calculateProgress(campaign.currentQuantity, campaign.targetQuantity)} className="h-2" />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{campaign.location}</span>
                <span>
                  {new Date(campaign.endDate).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
            <CardFooter className="px-4 pb-4 pt-0">
              <Button 
                onClick={() => handleViewCampaign(campaign._id)} 
                className="w-full"
              >
                {currentUser?.role === 'donor' ? 'Donate Now' : 'View Details'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CampaignTab; 