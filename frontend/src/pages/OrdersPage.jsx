import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheck, FiClock, FiChevronRight } from 'react-icons/fi';
import api from '../services/api';
import './OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders');
                setOrders(data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <FiCheck />;
            case 'shipped':
                return <FiTruck />;
            case 'processing':
                return <FiPackage />;
            default:
                return <FiClock />;
        }
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

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="orders-page page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">My Orders</h1>
                    <p className="text-secondary">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-state">
                        <FiPackage className="empty-state-icon" />
                        <h2 className="empty-state-title">No orders yet</h2>
                        <p className="empty-state-text">
                            When you place orders, they will appear here.
                        </p>
                        <Link to="/products" className="btn btn-primary">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order._id} className="order-card card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                                        <span className="order-date">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <span className={`order-status badge badge-${getStatusClass(order.status)}`}>
                                        {getStatusIcon(order.status)} {order.status}
                                    </span>
                                </div>

                                <div className="order-items-preview">
                                    {order.orderItems.slice(0, 3).map((item, index) => (
                                        <div key={index} className="order-item-thumb">
                                            <img
                                                src={item.image || '/placeholder.jpg'}
                                                alt={item.name}
                                            />
                                        </div>
                                    ))}
                                    {order.orderItems.length > 3 && (
                                        <div className="order-item-more">
                                            +{order.orderItems.length - 3}
                                        </div>
                                    )}
                                </div>

                                <div className="order-footer">
                                    <div className="order-total">
                                        <span className="total-label">Total</span>
                                        <span className="total-amount">${order.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <button className="btn btn-secondary order-details-btn">
                                        View Details <FiChevronRight />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
