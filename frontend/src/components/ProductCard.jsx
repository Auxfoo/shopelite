import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    const handleAddToWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please login to add to wishlist');
            return;
        }

        try {
            await api.post('/wishlist', { productId: product._id });
            toast.success('Added to wishlist!');
        } catch (error) {
            if (error.response?.data?.message?.includes('already')) {
                toast.error('Already in wishlist');
            } else {
                toast.error('Failed to add to wishlist');
            }
        }
    };

    const discountPercentage = product.comparePrice > product.price
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    return (
        <Link to={`/products/${product._id}`} className="product-card card">
            <div className="product-image-container">
                <img
                    src={product.thumbnail || product.images?.[0]?.url || '/placeholder.jpg'}
                    alt={product.name}
                    className="product-image"
                />
                {discountPercentage > 0 && (
                    <span className="product-discount">-{discountPercentage}%</span>
                )}
                {product.stock === 0 && (
                    <span className="product-out-of-stock">Out of Stock</span>
                )}
                <div className="product-actions">
                    <button
                        className="product-action-btn"
                        onClick={handleAddToWishlist}
                        title="Add to Wishlist"
                    >
                        <FiHeart />
                    </button>
                    <button
                        className="product-action-btn"
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        title="Add to Cart"
                    >
                        <FiShoppingCart />
                    </button>
                </div>
            </div>
            <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-rating">
                    <FiStar className="star-icon" />
                    <span>{product.rating?.toFixed(1) || '0.0'}</span>
                    <span className="rating-count">({product.numReviews || 0})</span>
                </div>
                <div className="product-price">
                    <span className="current-price">${product.price?.toFixed(2)}</span>
                    {product.comparePrice > product.price && (
                        <span className="compare-price">${product.comparePrice?.toFixed(2)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
