import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiCreditCard } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        phone: '',
    });

    const taxRate = 0.10;
    const shippingCost = cartTotal >= 100 ? 0 : 10;
    const taxAmount = cartTotal * taxRate;
    const totalAmount = cartTotal + taxAmount + shippingCost;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const required = ['fullName', 'street', 'city', 'state', 'zipCode', 'country'];
        for (const field of required) {
            if (!formData[field]) {
                toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return;
            }
        }

        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setLoading(true);

        try {
            // Create order
            const orderItems = cart.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
            }));

            const { data: order } = await api.post('/orders', {
                orderItems,
                shippingAddress: formData,
                paymentMethod: 'stripe',
            });

            // For demo purposes, we'll simulate a successful payment
            // In production, you would integrate with Stripe Elements here
            await api.put(`/orders/${order._id}/pay`, {
                id: 'demo_payment_' + Date.now(),
                status: 'completed',
                update_time: new Date().toISOString(),
            });

            await clearCart();
            toast.success('Order placed successfully!');
            navigate('/order-success', { state: { orderId: order._id } });

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="checkout-page page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Checkout</h1>
                </div>

                <div className="checkout-layout">
                    {/* Checkout Form */}
                    <form className="checkout-form" onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h3>Shipping Address</h3>

                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Street Address *</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="123 Main St, Apt 4"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="New York"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="NY"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">ZIP Code *</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="10001"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Country *</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone (optional)</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                <FiCreditCard /> Payment Method
                            </h3>
                            <div className="payment-info glass">
                                <p>
                                    <FiLock /> Your payment information is securely processed via Stripe.
                                </p>
                                <p className="demo-notice">
                                    Demo Mode: Click "Place Order" to simulate a successful payment.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg place-order-btn"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : `Place Order • $${totalAmount.toFixed(2)}`}
                        </button>
                    </form>

                    {/* Order Summary */}
                    <div className="checkout-summary glass">
                        <h3>Order Summary</h3>

                        <div className="checkout-items">
                            {cart.map((item) => (
                                <div key={item._id} className="checkout-item">
                                    <div className="checkout-item-image">
                                        <img
                                            src={item.product?.thumbnail || '/placeholder.jpg'}
                                            alt={item.product?.name}
                                        />
                                        <span className="item-qty">{item.quantity}</span>
                                    </div>
                                    <div className="checkout-item-info">
                                        <span className="item-name">{item.product?.name}</span>
                                        <span className="item-price">
                                            ${(item.product?.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (10%)</span>
                            <span>${taxAmount.toFixed(2)}</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
