import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiHeadphones, FiRefreshCw } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import './HomePage.css';

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get('/products/featured?limit=8'),
                    api.get('/products/categories'),
                ]);
                setFeaturedProducts(productsRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const features = [
        { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over $100' },
        { icon: FiShield, title: 'Secure Payment', desc: '100% secure checkout' },
        { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated support' },
        { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <span className="hero-badge">New Collection 2024</span>
                        <h1 className="hero-title">
                            Discover Premium
                            <span className="gradient-text"> Products</span>
                        </h1>
                        <p className="hero-subtitle">
                            Explore our curated collection of premium products.
                            Quality meets style at prices you'll love.
                        </p>
                        <div className="hero-actions">
                            <Link to="/products" className="btn btn-primary btn-lg">
                                Shop Now <FiArrowRight />
                            </Link>
                            <Link to="/products?featured=true" className="btn btn-secondary btn-lg">
                                View Featured
                            </Link>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-glow"></div>
                        <div className="hero-shape shape-1"></div>
                        <div className="hero-shape shape-2"></div>
                        <div className="hero-shape shape-3"></div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <div className="container">
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card glass">
                                <feature.icon className="feature-icon" />
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-desc">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="categories-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Shop by Category</h2>
                        <Link to="/products" className="section-link">
                            View All <FiArrowRight />
                        </Link>
                    </div>
                    <div className="categories-grid">
                        {categories.slice(0, 6).map((category, index) => (
                            <Link
                                key={index}
                                to={`/products?category=${encodeURIComponent(category)}`}
                                className="category-card"
                            >
                                <div className="category-icon">
                                    {category.charAt(0)}
                                </div>
                                <span className="category-name">{category}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="products-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured Products</h2>
                        <Link to="/products?featured=true" className="section-link">
                            View All <FiArrowRight />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="products-grid grid-4">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card glass">
                        <div className="cta-content">
                            <h2 className="cta-title">Join Our Newsletter</h2>
                            <p className="cta-subtitle">
                                Subscribe to get special offers, free giveaways, and exclusive deals.
                            </p>
                            <form className="cta-form">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="cta-input"
                                />
                                <button type="submit" className="btn btn-primary">
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
