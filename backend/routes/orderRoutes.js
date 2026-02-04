import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    getAllOrders,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All order routes require authentication

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/all', admin, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/status', admin, updateOrderStatus);

export default router;
