import express from 'express';
import {
    getDashboardStats,
    getUsers,
    updateUser,
    deleteUser,
    getSalesReport,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/reports/sales', getSalesReport);

export default router;
