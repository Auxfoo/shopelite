import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span className="logo-icon">◆</span>
                            <span>ShopElite</span>
                        </Link>
                        <p className="footer-tagline">
                            Premium e-commerce experience with the best products at amazing prices.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link"><FiTwitter /></a>
                            <a href="#" className="social-link"><FiInstagram /></a>
                            <a href="#" className="social-link"><FiGithub /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4 className="footer-title">Shop</h4>
                        <ul className="footer-links">
                            <li><Link to="/products">All Products</Link></li>
                            <li><Link to="/products?category=Electronics">Electronics</Link></li>
                            <li><Link to="/products?category=Clothing">Clothing</Link></li>
                            <li><Link to="/products?featured=true">Featured</Link></li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div className="footer-section">
                        <h4 className="footer-title">Account</h4>
                        <ul className="footer-links">
                            <li><Link to="/profile">My Profile</Link></li>
                            <li><Link to="/orders">Order History</Link></li>
                            <li><Link to="/wishlist">Wishlist</Link></li>
                            <li><Link to="/cart">Shopping Cart</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-section">
                        <h4 className="footer-title">Contact</h4>
                        <ul className="footer-contact">
                            <li>
                                <FiMail />
                                <span>support@shopelite.com</span>
                            </li>
                            <li>
                                <FiPhone />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li>
                                <FiMapPin />
                                <span>123 Commerce St, NY 10001</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} ShopElite. All rights reserved.</p>
                    <div className="footer-legal">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
