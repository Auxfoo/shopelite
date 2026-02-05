import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiClock, FiMapPin } from 'react-icons/fi';
import api from '../services/api';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error('Failed to fetch order:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

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

    if (!order) {
        return (
            <div className="page container">
                <div className="empty-state">
                    <FiPackage className="empty-state-icon" />
                    <h2>Order not found</h2>
                    <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="order-detail-page page">
            <div className="container">
                <Link to="/orders" className="back-link">
                    <FiArrowLeft /> Back to Orders
                </Link>

                <div className="order-detail-header">
                    <div>
                        <h1 className="page-title">Order #{order._id.slice(-8).toUpperCase()}</h1>
                        <p className="order-date">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                    <span className={`order-status badge badge-${getStatusClass(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                    </span>
                </div>

                <div className="order-detail-grid">
                    {/* Order Items */}
                    <div className="order-items-section card">
                        <h2 className="section-title">Items</h2>
                        <div className="order-items-list">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="order-item">
                                    <img
                                        src={item.image || '/placeholder.jpg'}
                                        alt={item.name}
                                        className="item-image"
                                    />
                                    <div className="item-details">
                                        <h3 className="item-name">{item.name}</h3>
                                        <p className="item-quantity">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="item-price">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary-section">
                        <div className="card">
                            <h2 className="section-title">Order Summary</h2>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${order.itemsPrice?.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>${order.shippingPrice?.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Tax</span>
                                <span>${order.taxPrice?.toFixed(2)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>${order.totalPrice?.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="card shipping-card">
                            <h2 className="section-title"><FiMapPin /> Shipping Address</h2>
                            <div className="address-details">
                                <p>{order.shippingAddress?.fullName}</p>
                                <p>{order.shippingAddress?.address}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                                <p>{order.shippingAddress?.country}</p>
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="card">
                            <h2 className="section-title">Payment</h2>
                            <div className={`payment-status ${order.isPaid ? 'paid' : 'unpaid'}`}>
                                {order.isPaid ? (
                                    <>
                                        <FiCheck /> Paid on {new Date(order.paidAt).toLocaleDateString()}
                                    </>
                                ) : (
                                    <>
                                        <FiClock /> Awaiting Payment
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
