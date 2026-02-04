import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import './WishlistPage.css';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const { data } = await api.get('/wishlist');
            setWishlist(data);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await api.delete(`/wishlist/${productId}`);
            setWishlist(wishlist.filter(item => item._id !== productId));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product);
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="wishlist-page page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">My Wishlist</h1>
                    <p className="text-secondary">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</p>
                </div>

                {wishlist.length === 0 ? (
                    <div className="empty-state">
                        <FiHeart className="empty-state-icon" />
                        <h2 className="empty-state-title">Your wishlist is empty</h2>
                        <p className="empty-state-text">
                            Save items you love to your wishlist and find them here.
                        </p>
                        <Link to="/products" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist-grid grid-4">
                        {wishlist.map((product) => (
                            <div key={product._id} className="wishlist-item card">
                                <Link to={`/products/${product._id}`} className="wishlist-item-image">
                                    <img
                                        src={product.thumbnail || product.images?.[0]?.url || '/placeholder.jpg'}
                                        alt={product.name}
                                    />
                                </Link>
                                <div className="wishlist-item-info">
                                    <Link to={`/products/${product._id}`} className="wishlist-item-name">
                                        {product.name}
                                    </Link>
                                    <span className="wishlist-item-price">${product.price?.toFixed(2)}</span>

                                    <div className="wishlist-item-actions">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.stock === 0}
                                        >
                                            <FiShoppingCart /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                        <button
                                            className="btn btn-icon remove-btn"
                                            onClick={() => handleRemove(product._id)}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
