import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate(
        'wishlist',
        'name price thumbnail rating numReviews stock comparePrice'
    );

    res.json(user.wishlist);
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const user = await User.findById(req.user._id);

    // Check if already in wishlist
    if (user.wishlist.includes(productId)) {
        res.status(400);
        throw new Error('Product already in wishlist');
    }

    user.wishlist.push(productId);
    await user.save();

    // Return populated wishlist
    const updatedUser = await User.findById(req.user._id).populate(
        'wishlist',
        'name price thumbnail rating numReviews stock comparePrice'
    );

    res.json(updatedUser.wishlist);
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId
    );
    await user.save();

    // Return populated wishlist
    const updatedUser = await User.findById(req.user._id).populate(
        'wishlist',
        'name price thumbnail rating numReviews stock comparePrice'
    );

    res.json(updatedUser.wishlist);
});

export { getWishlist, addToWishlist, removeFromWishlist };
