import { useState, useEffect } from 'react';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import api from '../../services/api';
import './DashboardPage.css';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/dashboard');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Revenue', value: `$${stats?.stats?.totalRevenue?.toFixed(2) || 0}`, icon: FiDollarSign, color: 'success' },
        { label: 'Total Orders', value: stats?.stats?.totalOrders || 0, icon: FiShoppingBag, color: 'primary' },
        { label: 'Total Products', value: stats?.stats?.totalProducts || 0, icon: FiPackage, color: 'warning' },
        { label: 'Total Users', value: stats?.stats?.totalUsers || 0, icon: FiUsers, color: 'secondary' },
    ];

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="text-secondary">Welcome to your admin dashboard</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className={`stat-card glass stat-${stat.color}`}>
                        <div className="stat-icon">
                            <stat.icon />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-value">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                {/* Daily Sales Chart */}
                <div className="dashboard-card glass">
                    <h3><FiTrendingUp /> Recent Sales</h3>
                    <div className="sales-chart">
                        {stats?.dailyRevenue?.slice(0, 7).map((day, index) => (
                            <div key={index} className="chart-bar">
                                <div
                                    className="bar-fill"
                                    style={{
                                        height: `${Math.max(10, (day.revenue / (stats.dailyRevenue.reduce((max, d) => Math.max(max, d.revenue), 1))) * 100)}%`
                                    }}
                                ></div>
                                <span className="bar-label">{day._id}</span>
                                <span className="bar-value">${day.revenue?.toFixed(0) || 0}</span>
                            </div>
                        ))}
                        {(!stats?.dailyRevenue || stats.dailyRevenue.length === 0) && (
                            <p className="no-data">No sales data yet</p>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="dashboard-card glass">
                    <h3><FiPackage /> Top Products</h3>
                    <div className="top-products">
                        {stats?.topProducts?.slice(0, 5).map((product, index) => (
                            <div key={product._id} className="top-product-item">
                                <span className="rank">#{index + 1}</span>
                                <div className="product-info">
                                    <span className="product-name">{product.name}</span>
                                    <span className="product-sold">{product.totalSold} sold</span>
                                </div>
                            </div>
                        ))}
                        {(!stats?.topProducts || stats.topProducts.length === 0) && (
                            <p className="no-data">No sales data yet</p>
                        )}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="dashboard-card glass">
                    <h3><FiAlertTriangle /> Low Stock Alert</h3>
                    <div className="low-stock-list">
                        {stats?.lowStockProducts?.slice(0, 5).map((product) => (
                            <div key={product._id} className="low-stock-item">
                                <span className="product-name">{product.name}</span>
                                <span className={`stock-count ${product.stock <= 5 ? 'critical' : ''}`}>
                                    {product.stock} left
                                </span>
                            </div>
                        ))}
                        {(!stats?.lowStockProducts || stats.lowStockProducts.length === 0) && (
                            <p className="no-data">All products are well stocked!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
