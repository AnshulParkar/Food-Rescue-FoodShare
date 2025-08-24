import express from 'express';
import { validateExpiry } from '../controllers/imageValidationController';

const router = express.Router();

router.post('/validate-expiry', validateExpiry);

export default router;