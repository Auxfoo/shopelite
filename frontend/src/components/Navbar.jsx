import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">◆</span>
                    <span className="logo-text">ShopElite</span>
                </Link>

                {/* Search Bar */}
                <form className="navbar-search" onSubmit={handleSearch}>
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </form>

                {/* Desktop Navigation */}
                <div className="navbar-links">
                    <Link to="/products" className="nav-link">Products</Link>

                    {user ? (
                        <>
                            <Link to="/wishlist" className="nav-icon-link" title="Wishlist">
                                <FiHeart />
                            </Link>

                            <Link to="/cart" className="nav-icon-link cart-link" title="Cart">
                                <FiShoppingCart />
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>

                            <div className="user-menu-container">
                                <button
                                    className="user-menu-trigger"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <div className="user-avatar">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="user-name">{user.name}</span>
                                </button>

                                {showUserMenu && (
                                    <div className="user-menu glass">
                                        <div className="user-menu-header">
                                            <span className="user-menu-name">{user.name}</span>
                                            <span className="user-menu-email">{user.email}</span>
                                        </div>
                                        <div className="user-menu-divider"></div>
                                        <Link to="/profile" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                                            <FiUser /> Profile
                                        </Link>
                                        <Link to="/orders" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                                            <FiPackage /> Orders
                                        </Link>
                                        {isAdmin && (
                                            <Link to="/admin" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                                                <FiSettings /> Admin Dashboard
                                            </Link>
                                        )}
                                        <div className="user-menu-divider"></div>
                                        <button className="user-menu-item logout" onClick={handleLogout}>
                                            <FiLogOut /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/cart" className="nav-icon-link cart-link" title="Cart">
                                <FiShoppingCart />
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                    {showMobileMenu ? <FiX /> : <FiMenu />}
                </button>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="mobile-menu glass">
                        <form className="mobile-search" onSubmit={handleSearch}>
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                        <Link to="/products" onClick={() => setShowMobileMenu(false)}>Products</Link>
                        <Link to="/cart" onClick={() => setShowMobileMenu(false)}>
                            Cart {cartCount > 0 && `(${cartCount})`}
                        </Link>
                        {user ? (
                            <>
                                <Link to="/wishlist" onClick={() => setShowMobileMenu(false)}>Wishlist</Link>
                                <Link to="/profile" onClick={() => setShowMobileMenu(false)}>Profile</Link>
                                <Link to="/orders" onClick={() => setShowMobileMenu(false)}>Orders</Link>
                                {isAdmin && (
                                    <Link to="/admin" onClick={() => setShowMobileMenu(false)}>Admin</Link>
                                )}
                                <button onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setShowMobileMenu(false)}>Login</Link>
                                <Link to="/register" onClick={() => setShowMobileMenu(false)}>Sign Up</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
