import { Request, Response } from 'express';
import Campaign, { ICampaign } from '../models/Campaign.js';
import CampaignDonation, { ICampaignDonation } from '../models/CampaignDonation.js';
import mongoose from 'mongoose';

// Get all campaigns
export const getAllCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find().exec();
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Failed to fetch campaigns' });
  }
};

// Get campaign by ID
export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }
    
    const campaign = await Campaign.findById(id).exec();
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Failed to fetch campaign' });
  }
};

// Create a new campaign
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, 
      recipientId, 
      recipientName, 
      targetQuantity, 
      foodType, 
      location, 
      status, 
      endDate, 
      imageUrl 
    } = req.body;
    
    // Basic validation
    if (!title || !description || !recipientId || !targetQuantity || !foodType || !location || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newCampaign = new Campaign({
      title,
      description,
      recipientId,
      recipientName,
      targetQuantity,
      currentQuantity: 0,
      foodType,
      location,
      status: status || 'active',
      endDate: new Date(endDate),
      imageUrl
    });
    
    const savedCampaign = await newCampaign.save();
    res.status(201).json(savedCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Failed to create campaign' });
  }
};

// Update campaign
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }
    
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    ).exec();
    
    if (!updatedCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.status(200).json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Failed to update campaign' });
  }
};

// Delete campaign
export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }
    
    const deletedCampaign = await Campaign.findByIdAndDelete(id).exec();
    
    if (!deletedCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Failed to delete campaign' });
  }
};

// Donate to campaign
export const donateToCampaign = async (req: Request, res: Response) => {
  try {
    const { campaignId, donorId, quantity, foodType, status, recipientId } = req.body;
    
    // Basic validation
    if (!campaignId || !donorId || !quantity || !foodType || !recipientId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Find the campaign
    const campaign = await Campaign.findById(campaignId).exec();
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Create new donation
    const newDonation = new CampaignDonation({
      campaignId,
      donorId,
      quantity,
      foodType,
      status: status || 'pending',
      recipientId
    });
    
    const savedDonation = await newDonation.save();
    
    // Update campaign's current quantity
    campaign.currentQuantity += quantity;
    
    // If campaign has reached its target, mark as completed
    if (campaign.currentQuantity >= campaign.targetQuantity) {
      campaign.status = 'completed';
    }
    
    await campaign.save();
    
    res.status(201).json({
      donation: savedDonation,
      campaign: campaign
    });
  } catch (error) {
    console.error('Error donating to campaign:', error);
    res.status(500).json({ message: 'Failed to process donation' });
  }
};

// Get campaigns by user ID (recipient's campaigns)
export const getUserCampaigns = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const campaigns = await Campaign.find({ recipientId: userId }).exec();
    
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    res.status(500).json({ message: 'Failed to fetch user campaigns' });
  }
}; 