import express from 'express';
import {
    updateReview,
    deleteReview,
    markReviewHelpful,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', protect, markReviewHelpful);

export default router;
