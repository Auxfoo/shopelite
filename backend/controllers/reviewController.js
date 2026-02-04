import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const count = await Review.countDocuments({ product: req.params.productId });
    const reviews = await Review.find({ product: req.params.productId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .lean();

    res.json({
        reviews,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

// @desc    Create a review
// @route   POST /api/products/:productId/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { rating, title, comment } = req.body;
    const productId = req.params.productId;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
        product: productId,
        user: req.user._id,
    });

    if (alreadyReviewed) {
        res.status(400);
        throw new Error('You have already reviewed this product');
    }

    // Check if user purchased the product (verified purchase)
    const hasPurchased = await Order.findOne({
        user: req.user._id,
        'orderItems.product': productId,
        isPaid: true,
    });

    const review = await Review.create({
        user: req.user._id,
        product: productId,
        rating,
        title,
        comment,
        isVerifiedPurchase: !!hasPurchased,
    });

    const populatedReview = await Review.findById(review._id).populate(
        'user',
        'name avatar'
    );

    res.status(201).json(populatedReview);
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
    const { rating, title, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this review');
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;

    await review.save();

    const updatedReview = await Review.findById(review._id).populate(
        'user',
        'name avatar'
    );

    res.json(updatedReview);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    // Check ownership or admin
    if (
        review.user.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
    ) {
        res.status(403);
        throw new Error('Not authorized to delete this review');
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review removed' });
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const markReviewHelpful = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    review.helpful += 1;
    await review.save();

    res.json({ helpful: review.helpful });
});

export {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    markReviewHelpful,
};
