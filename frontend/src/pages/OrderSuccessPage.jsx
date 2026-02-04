import { Link, useLocation } from 'react-router-dom';
import { FiCheck, FiPackage, FiArrowRight } from 'react-icons/fi';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
    const location = useLocation();
    const orderId = location.state?.orderId;

    return (
        <div className="order-success-page page">
            <div className="container">
                <div className="success-content glass">
                    <div className="success-icon">
                        <FiCheck />
                    </div>
                    <h1>Order Placed Successfully!</h1>
                    <p className="success-message">
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>

                    {orderId && (
                        <div className="order-number">
                            <span>Order Number</span>
                            <strong>#{orderId.slice(-8).toUpperCase()}</strong>
                        </div>
                    )}

                    <div className="order-steps">
                        <div className="order-step active">
                            <FiCheck />
                            <span>Order Placed</span>
                        </div>
                        <div className="step-line"></div>
                        <div className="order-step">
                            <FiPackage />
                            <span>Processing</span>
                        </div>
                        <div className="step-line"></div>
                        <div className="order-step">
                            <FiPackage />
                            <span>Shipped</span>
                        </div>
                        <div className="step-line"></div>
                        <div className="order-step">
                            <FiCheck />
                            <span>Delivered</span>
                        </div>
                    </div>

                    <p className="confirmation-email">
                        A confirmation email has been sent to your registered email address.
                    </p>

                    <div className="success-actions">
                        <Link to="/orders" className="btn btn-primary">
                            View My Orders <FiArrowRight />
                        </Link>
                        <Link to="/products" className="btn btn-secondary">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
