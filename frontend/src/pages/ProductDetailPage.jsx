import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar, FiMinus, FiPlus, FiChevronLeft, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const [productRes, reviewsRes] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get(`/products/${id}/reviews`),
                ]);
                setProduct(productRes.data);
                setReviews(reviewsRes.data.reviews || []);
            } catch (error) {
                console.error('Failed to fetch product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
        }
    };

    const handleAddToWishlist = async () => {
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

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please login to write a review');
            return;
        }
        if (!reviewForm.comment.trim()) {
            toast.error('Please write a comment');
            return;
        }
        setSubmittingReview(true);
        try {
            const { data } = await api.post(`/products/${id}/reviews`, reviewForm);
            setReviews([data, ...reviews]);
            setReviewForm({ rating: 5, comment: '' });
            toast.success('Review submitted!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="page container">
                <div className="empty-state">
                    <h2>Product not found</h2>
                    <Link to="/products" className="btn btn-primary">Browse Products</Link>
                </div>
            </div>
        );
    }

    const discountPercentage = product.comparePrice > product.price
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    const images = product.images?.length > 0
        ? product.images
        : [{ url: product.thumbnail || '/placeholder.jpg' }];

    return (
        <div className="product-detail-page page">
            <div className="container">
                <Link to="/products" className="back-link">
                    <FiChevronLeft /> Back to Products
                </Link>

                <div className="product-detail-layout">
                    {/* Images */}
                    <div className="product-images">
                        <div className="main-image-container">
                            <img
                                src={images[selectedImage]?.url}
                                alt={product.name}
                                className="main-image"
                            />
                            {discountPercentage > 0 && (
                                <span className="discount-badge">-{discountPercentage}%</span>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="thumbnail-list">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={image.url} alt={`${product.name} ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-info-detail">
                        <span className="product-category-badge">{product.category}</span>
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-meta">
                            <div className="product-rating-detail">
                                <FiStar className="star-filled" />
                                <span className="rating-value">{product.rating?.toFixed(1) || '0.0'}</span>
                                <span className="rating-count">({product.numReviews || 0} reviews)</span>
                            </div>
                            {product.brand && (
                                <span className="product-brand">by {product.brand}</span>
                            )}
                        </div>

                        <div className="product-price-detail">
                            <span className="current-price">${product.price?.toFixed(2)}</span>
                            {product.comparePrice > product.price && (
                                <span className="compare-price">${product.comparePrice?.toFixed(2)}</span>
                            )}
                        </div>

                        <p className="product-description">{product.description}</p>

                        {/* Stock Status */}
                        <div className="stock-status">
                            {product.stock > 0 ? (
                                <span className="in-stock">
                                    ✓ In Stock ({product.stock} available)
                                </span>
                            ) : (
                                <span className="out-of-stock">✗ Out of Stock</span>
                            )}
                        </div>

                        {/* Quantity & Actions */}
                        {product.stock > 0 && (
                            <div className="product-actions-detail">
                                <div className="quantity-selector">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        <FiMinus />
                                    </button>
                                    <span>{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        disabled={quantity >= product.stock}
                                    >
                                        <FiPlus />
                                    </button>
                                </div>

                                <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                                    <FiShoppingCart /> Add to Cart
                                </button>

                                <button className="btn btn-secondary btn-icon" onClick={handleAddToWishlist}>
                                    <FiHeart />
                                </button>
                            </div>
                        )}

                        {/* Specifications */}
                        {product.specifications?.length > 0 && (
                            <div className="product-specs">
                                <h3>Specifications</h3>
                                <table className="specs-table">
                                    <tbody>
                                        {product.specifications.map((spec, index) => (
                                            <tr key={index}>
                                                <td>{spec.name}</td>
                                                <td>{spec.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-section">
                    <h2>Customer Reviews</h2>

                    {/* Review Form */}
                    {isAuthenticated && (
                        <form className="review-form glass" onSubmit={handleSubmitReview}>
                            <h3>Write a Review</h3>
                            <div className="rating-input">
                                <label>Rating:</label>
                                <div className="star-rating">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`star-btn ${reviewForm.rating >= star ? 'active' : ''}`}
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                        >
                                            <FiStar />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <textarea
                                className="form-input"
                                placeholder="Share your experience with this product..."
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                rows={4}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submittingReview}
                            >
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                        <p className="no-reviews">No reviews yet. Be the first to review!</p>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map((review) => (
                                <div key={review._id} className="review-card">
                                    <div className="review-header">
                                        <div className="reviewer-info">
                                            <div className="reviewer-avatar">
                                                <FiUser />
                                            </div>
                                            <div>
                                                <span className="reviewer-name">{review.user?.name || 'User'}</span>
                                                {review.isVerifiedPurchase && (
                                                    <span className="verified-badge">Verified Purchase</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="review-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar
                                                    key={i}
                                                    className={i < review.rating ? 'star-filled' : 'star-empty'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                    <span className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
