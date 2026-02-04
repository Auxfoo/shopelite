import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    // Build query
    let query = { isActive: true };

    // Category filter
    if (req.query.category) {
        query.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
        query.price = {};
        if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Rating filter
    if (req.query.rating) {
        query.rating = { $gte: Number(req.query.rating) };
    }

    // Search
    if (req.query.search) {
        query.$text = { $search: req.query.search };
    }

    // Featured filter
    if (req.query.featured === 'true') {
        query.featured = true;
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
        switch (req.query.sort) {
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'rating':
                sortOption = { rating: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'name':
                sortOption = { name: 1 };
                break;
        }
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
        .sort(sortOption)
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .lean();

    res.json({
        products,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find({ featured: true, isActive: true })
        .limit(limit)
        .lean();

    res.json(products);
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Product.distinct('category');
    res.json(categories);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        comparePrice,
        category,
        subcategory,
        brand,
        stock,
        images,
        thumbnail,
        featured,
        tags,
        specifications,
    } = req.body;

    const product = await Product.create({
        name,
        description,
        price,
        comparePrice,
        category,
        subcategory,
        brand,
        stock,
        images,
        thumbnail,
        featured,
        tags,
        specifications,
    });

    res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

export {
    getProducts,
    getProductById,
    getFeaturedProducts,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
};
