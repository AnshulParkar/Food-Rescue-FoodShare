import express from 'express';
import { uploadImage, getUploadUrl } from '../controllers/imageUploadController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Protected routes (require authentication)
router.post('/upload', authenticateToken, uploadImage);
router.get('/upload-url', authenticateToken, getUploadUrl);

export default router;