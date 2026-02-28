import express from 'express';
import { getWallet, createOrder, verifyPayment } from '../controllers/walletController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.get('/', protect, getWallet);
router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
export default router;
