import express from 'express';
import {
  getDonations,
  getDonationById,
  createDonation,
  updateDonation,
  updateDonationStatus,
  deleteDonation,
  getAnalytics
} from '../controllers/donationController.js';

const router = express.Router();

// Donation routes
router.get('/', getDonations);
router.get('/analytics', getAnalytics);
router.get('/:id', getDonationById);
router.post('/', createDonation);
router.put('/:id', updateDonation);
router.put('/:id/status', updateDonationStatus);
router.delete('/:id', deleteDonation);

export default router;