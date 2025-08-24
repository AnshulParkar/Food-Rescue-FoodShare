import express from 'express';
import { 
  getAllCampaigns, 
  getCampaignById, 
  createCampaign, 
  updateCampaign, 
  deleteCampaign, 
  donateToCampaign, 
  getUserCampaigns 
} from '../controllers/campaignController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllCampaigns);
router.get('/user/:userId', getUserCampaigns);
router.get('/:id', getCampaignById);

// Protected routes (require auth)
router.post('/', authenticateToken, createCampaign);
router.post('/donate', authenticateToken, donateToCampaign);
router.put('/:id', authenticateToken, updateCampaign);
router.delete('/:id', authenticateToken, deleteCampaign);

export default router; 