import { api } from './api';

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

interface CampaignDonation {
  campaignId: string;
  donorId: string;
  quantity: number;
  foodType: string;
  status: 'pending' | 'delivered' | 'cancelled';
  recipientId: string;
}

export const campaignService = {
  getAllCampaigns: async (): Promise<Campaign[]> => {
    const response = await api.get('/api/campaigns');
    return response.data;
  },

  getCampaignById: async (id: string): Promise<Campaign> => {
    const response = await api.get(`/api/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (campaignData: Omit<Campaign, '_id'>): Promise<Campaign> => {
    const response = await api.post('/api/campaigns', campaignData);
    return response.data;
  },

  updateCampaign: async (id: string, campaignData: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.put(`/api/campaigns/${id}`, campaignData);
    return response.data;
  },

  deleteCampaign: async (id: string): Promise<void> => {
    await api.delete(`/api/campaigns/${id}`);
  },

  donateToCampaign: async (donationData: CampaignDonation): Promise<any> => {
    const response = await api.post('/api/campaigns/donate', donationData);
    return response.data;
  },

  getUserCampaigns: async (userId: string): Promise<Campaign[]> => {
    const response = await api.get(`/api/campaigns/user/${userId}`);
    return response.data;
  }
}; 