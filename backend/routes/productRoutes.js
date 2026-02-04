import express from 'express';
import {
    getProducts,
    getProductById,
    getFeaturedProducts,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';
import {
    getProductReviews,
    createReview,
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Review routes
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', protect, createReview);

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
