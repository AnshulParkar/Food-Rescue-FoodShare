import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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

const CampaignsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        let fetchedCampaigns;
        
        // For recipients, show only their own campaigns
        if (currentUser && currentUser.role === 'recipient') {
          fetchedCampaigns = await campaignService.getUserCampaigns(currentUser.id);
        } else {
          // For donors or public view, show all active campaigns
          fetchedCampaigns = await campaignService.getAllCampaigns();
        }
        
        setCampaigns(fetchedCampaigns);
        setFilteredCampaigns(fetchedCampaigns);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        toast.error('Failed to load campaigns. Please try again.');
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [currentUser]);

  // Apply filters and search
  useEffect(() => {
    let results = campaigns;
    
    // Filter by status
    if (filterStatus !== 'all') {
      results = results.filter(campaign => campaign.status === filterStatus);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        campaign =>
          campaign.title.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query) ||
          campaign.location.toLowerCase().includes(query) ||
          campaign.foodType.toLowerCase().includes(query) ||
          campaign.recipientName.toLowerCase().includes(query)
      );
    }
    
    setFilteredCampaigns(results);
  }, [searchQuery, filterStatus, campaigns]);

  const handleViewCampaign = (id: string) => {
    navigate(`/campaigns/${id}`);
  };

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

  // Handle create new campaign
  const handleCreateCampaign = () => {
    if (!currentUser) {
      toast.error('Please sign in to create a campaign');
      navigate('/signin');
      return;
    }
    
    if (currentUser.role !== 'recipient') {
      toast.error('Only recipients can create campaigns');
      return;
    }
    
    navigate('/campaigns/create');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {currentUser?.role === 'recipient' ? 'My Campaigns' : 'Food Campaigns'}
            </h1>
            <p className="text-gray-500 mt-1">
              {currentUser?.role === 'recipient'
                ? 'Manage your food donation campaigns'
                : 'Support food donation campaigns in your community'}
            </p>
          </div>
          
          {currentUser?.role === 'recipient' && (
            <Button 
              onClick={handleCreateCampaign}
              className="bg-foodshare-500 hover:bg-foodshare-600 text-white"
            >
              Create New Campaign
            </Button>
          )}
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search campaigns..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('active')}
              size="sm"
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('completed')}
              size="sm"
            >
              Completed
            </Button>
          </div>
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
              {searchQuery || filterStatus !== 'all' ? (
                <>
                  No campaigns match your search or filter criteria.
                  <Button variant="link" onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}>
                    Clear filters
                  </Button>
                </>
              ) : currentUser?.role === 'recipient' ? (
                <>
                  You haven't created any campaigns yet.
                  <Button variant="link" onClick={handleCreateCampaign}>
                    Create your first campaign
                  </Button>
                </>
              ) : (
                'No campaigns are currently available.'
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
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{campaign.title}</h3>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
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
                  View Campaign
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage; 