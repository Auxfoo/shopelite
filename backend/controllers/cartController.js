import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate(
        'cart.product',
        'name price thumbnail stock images'
    );

    res.json(user.cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.stock < quantity) {
        res.status(400);
        throw new Error('Not enough stock available');
    }

    const user = await User.findById(req.user._id);

    // Check if item already in cart
    const existingItem = user.cart.find(
        (item) => item.product.toString() === productId
    );

    if (existingItem) {
        // Update quantity
        existingItem.quantity += quantity;
        if (existingItem.quantity > product.stock) {
            existingItem.quantity = product.stock;
        }
    } else {
        // Add new item
        user.cart.push({ product: productId, quantity });
    }

    await user.save();

    // Return populated cart
    const updatedUser = await User.findById(req.user._id).populate(
        'cart.product',
        'name price thumbnail stock images'
    );

    res.json(updatedUser.cart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const user = await User.findById(req.user._id);
    const cartItem = user.cart.id(itemId);

    if (!cartItem) {
        res.status(404);
        throw new Error('Cart item not found');
    }

    // Check stock
    const product = await Product.findById(cartItem.product);
    if (quantity > product.stock) {
        res.status(400);
        throw new Error('Not enough stock available');
    }

    if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        user.cart.pull(itemId);
    } else {
        cartItem.quantity = quantity;
    }

    await user.save();

    // Return populated cart
    const updatedUser = await User.findById(req.user._id).populate(
        'cart.product',
        'name price thumbnail stock images'
    );

    res.json(updatedUser.cart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const user = await User.findById(req.user._id);
    user.cart.pull(itemId);
    await user.save();

    // Return populated cart
    const updatedUser = await User.findById(req.user._id).populate(
        'cart.product',
        'name price thumbnail stock images'
    );

    res.json(updatedUser.cart);
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json([]);
});

export { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
