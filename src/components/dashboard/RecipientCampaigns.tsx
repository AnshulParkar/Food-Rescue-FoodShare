import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { campaignService } from '@/services/campaignService';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Campaign {
  _id: string;
  title: string;
  description: string;
  targetQuantity: number;
  currentQuantity: number;
  foodType: string;
  location: string;
  endDate: string;
  status: 'active' | 'completed' | 'expired';
  imageUrl: string;
  recipientId: string;
  recipientName: string;
}

const RecipientCampaigns = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to the campaigns page
    navigate('/campaigns');
  }, [navigate]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      let data: Campaign[];
      
      if (currentUser?.role === 'recipient') {
        // For recipients, show their own campaigns
        data = await campaignService.getUserCampaigns(currentUser.id);
      } else {
        // For donors and others, show all active campaigns
        data = await campaignService.getAllCampaigns();
        // Filter to only show active campaigns
        data = data.filter(campaign => campaign.status === 'active');
      }
      
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (campaign: Campaign) => {
    return Math.min((campaign.currentQuantity / campaign.targetQuantity) * 100, 100);
  };

  return null;
};

export default RecipientCampaigns; 