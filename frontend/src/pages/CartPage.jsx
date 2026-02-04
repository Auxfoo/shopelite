import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartPage.css';

const CartPage = () => {
    const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const taxRate = 0.10;
    const shippingThreshold = 100;
    const shippingCost = cartTotal >= shippingThreshold ? 0 : 10;
    const taxAmount = cartTotal * taxRate;
    const totalAmount = cartTotal + taxAmount + shippingCost;

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
        } else {
            navigate('/checkout');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="cart-page page">
                <div className="container">
                    <div className="empty-state">
                        <FiShoppingBag className="empty-state-icon" />
                        <h2 className="empty-state-title">Your cart is empty</h2>
                        <p className="empty-state-text">
                            Looks like you haven't added any items to your cart yet.
                        </p>
                        <Link to="/products" className="btn btn-primary">
                            Start Shopping <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Shopping Cart</h1>
                    <p className="text-secondary">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
                </div>

                <div className="cart-layout">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cart.map((item) => (
                            <div key={item._id} className="cart-item card">
                                <Link to={`/products/${item.product?._id}`} className="cart-item-image">
                                    <img
                                        src={item.product?.thumbnail || item.product?.images?.[0]?.url || '/placeholder.jpg'}
                                        alt={item.product?.name}
                                    />
                                </Link>
                                <div className="cart-item-info">
                                    <Link to={`/products/${item.product?._id}`} className="cart-item-name">
                                        {item.product?.name}
                                    </Link>
                                    <span className="cart-item-price">${item.product?.price?.toFixed(2)}</span>

                                    <div className="cart-item-actions">
                                        <div className="quantity-selector">
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <FiMinus />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                disabled={item.quantity >= (item.product?.stock || 99)}
                                            >
                                                <FiPlus />
                                            </button>
                                        </div>
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeFromCart(item._id)}
                                        >
                                            <FiTrash2 /> Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="cart-item-subtotal">
                                    ${(item.product?.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}

                        <button className="clear-cart-btn" onClick={clearCart}>
                            Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary glass">
                        <h3>Order Summary</h3>

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

                        {cartTotal < shippingThreshold && (
                            <p className="shipping-notice">
                                Add ${(shippingThreshold - cartTotal).toFixed(2)} more for free shipping!
                            </p>
                        )}

                        <div className="summary-divider"></div>

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>

                        <button className="btn btn-primary btn-lg checkout-btn" onClick={handleCheckout}>
                            Proceed to Checkout <FiArrowRight />
                        </button>

                        <Link to="/products" className="continue-shopping">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
