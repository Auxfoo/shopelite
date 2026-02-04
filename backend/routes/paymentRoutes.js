import express from 'express';
import {
    createPaymentIntent,
    createCheckoutSession,
    handleWebhook,
    getStripeConfig,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/config', getStripeConfig);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/create-checkout-session', protect, createCheckoutSession);

export default router;
