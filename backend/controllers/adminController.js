import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    // Get date range for stats
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    // Basic counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Revenue stats
    const revenueStats = await Order.aggregate([
        { $match: { isPaid: true } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' },
                averageOrderValue: { $avg: '$totalPrice' },
            },
        },
    ]);

    // Recent orders (last 30 days)
    const recentOrdersCount = await Order.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });

    // Orders by status
    const ordersByStatus = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    // Daily revenue for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
        {
            $match: {
                isPaid: true,
                createdAt: { $gte: sevenDaysAgo },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
        { $unwind: '$orderItems' },
        {
            $group: {
                _id: '$orderItems.product',
                totalSold: { $sum: '$orderItems.quantity' },
                revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
            },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product',
            },
        },
        { $unwind: '$product' },
        {
            $project: {
                name: '$product.name',
                thumbnail: '$product.thumbnail',
                totalSold: 1,
                revenue: 1,
            },
        },
    ]);

    // Recent orders
    const recentOrders = await Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    // Low stock products
    const lowStockProducts = await Product.find({ stock: { $lte: 10 }, isActive: true })
        .select('name stock thumbnail')
        .sort({ stock: 1 })
        .limit(10)
        .lean();

    res.json({
        stats: {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue: revenueStats[0]?.totalRevenue || 0,
            averageOrderValue: revenueStats[0]?.averageOrderValue || 0,
            recentOrdersCount,
        },
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        dailyRevenue,
        topProducts,
        recentOrders,
        lowStockProducts,
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;

    let query = {};

    // Search by name or email
    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
        ];
    }

    // Filter by role
    if (req.query.role) {
        query.role = req.query.role;
    }

    const count = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .lean();

    res.json({
        users,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.role = req.body.role || user.role;
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Cannot delete your own account');
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User removed' });
});

// @desc    Get sales report
// @route   GET /api/admin/reports/sales
// @access  Private/Admin
const getSalesReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
        dateFilter = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
        };
    }

    const salesByCategory = await Order.aggregate([
        { $match: { isPaid: true, ...dateFilter } },
        { $unwind: '$orderItems' },
        {
            $lookup: {
                from: 'products',
                localField: 'orderItems.product',
                foreignField: '_id',
                as: 'productDetails',
            },
        },
        { $unwind: '$productDetails' },
        {
            $group: {
                _id: '$productDetails.category',
                totalSales: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
                itemsSold: { $sum: '$orderItems.quantity' },
            },
        },
        { $sort: { totalSales: -1 } },
    ]);

    const monthlySales = await Order.aggregate([
        { $match: { isPaid: true, ...dateFilter } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                totalSales: { $sum: '$totalPrice' },
                orderCount: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
        salesByCategory,
        monthlySales,
    });
});

export {
    getDashboardStats,
    getUsers,
    updateUser,
    deleteUser,
    getSalesReport,
};
