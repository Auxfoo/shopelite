import { useState, useEffect } from 'react';
import { FiSearch, FiCheck, FiX, FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/all');
            // API returns { orders, page, pages, total }
            setOrders(data.orders || data);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(orders.map(o =>
                o._id === orderId ? { ...o, status: newStatus } : o
            ));
            toast.success('Order status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <FiCheckCircle />;
            case 'shipped':
                return <FiTruck />;
            case 'processing':
                return <FiPackage />;
            default:
                return null;
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1 className="page-title">Orders</h1>
                <span className="order-count">{orders.length} total orders</span>
            </div>

            <div className="admin-toolbar">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="form-input filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Paid</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order._id}>
                                <td className="order-id-cell">#{order._id.slice(-8).toUpperCase()}</td>
                                <td>{order.user?.name || 'N/A'}</td>
                                <td>{order.orderItems?.length} items</td>
                                <td className="price-cell">${order.totalPrice?.toFixed(2)}</td>
                                <td>
                                    {order.isPaid ? (
                                        <span className="badge badge-success"><FiCheck /> Paid</span>
                                    ) : (
                                        <span className="badge badge-error"><FiX /> Unpaid</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`badge badge-${getStatusClass(order.status)}`}>
                                        {getStatusIcon(order.status)} {order.status}
                                    </span>
                                </td>
                                <td className="date-cell">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <select
                                        className="status-select"
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const getStatusClass = (status) => {
    switch (status) {
        case 'delivered':
            return 'success';
        case 'shipped':
            return 'primary';
        case 'processing':
            return 'warning';
        case 'cancelled':
            return 'error';
        default:
            return 'secondary';
    }
};

export default OrdersManagement;
