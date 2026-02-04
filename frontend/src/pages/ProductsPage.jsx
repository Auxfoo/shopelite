import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import './ProductsPage.css';

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [showFilters, setShowFilters] = useState(false);

    // Filter states from URL
    const currentCategory = searchParams.get('category') || '';
    const currentSort = searchParams.get('sort') || 'newest';
    const currentSearch = searchParams.get('search') || '';
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const currentMinPrice = searchParams.get('minPrice') || '';
    const currentMaxPrice = searchParams.get('maxPrice') || '';

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/products/categories');
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (currentCategory) params.append('category', currentCategory);
                if (currentSort) params.append('sort', currentSort);
                if (currentSearch) params.append('search', currentSearch);
                if (currentMinPrice) params.append('minPrice', currentMinPrice);
                if (currentMaxPrice) params.append('maxPrice', currentMaxPrice);
                params.append('page', currentPage);
                params.append('limit', 12);

                const { data } = await api.get(`/products?${params.toString()}`);
                setProducts(data.products);
                setPagination({ page: data.page, pages: data.pages, total: data.total });
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [currentCategory, currentSort, currentSearch, currentPage, currentMinPrice, currentMaxPrice]);

    const updateFilters = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        newParams.set('page', '1'); // Reset to page 1 when filters change
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'name', label: 'Name: A to Z' },
    ];

    const hasActiveFilters = currentCategory || currentMinPrice || currentMaxPrice;

    return (
        <div className="products-page page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">
                        {currentSearch ? `Search: "${currentSearch}"` : currentCategory || 'All Products'}
                    </h1>
                    <p className="text-secondary">
                        {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
                    </p>
                </div>

                <div className="products-layout">
                    {/* Filters Sidebar */}
                    <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
                        <div className="filters-header">
                            <h3>Filters</h3>
                            <button className="filters-close" onClick={() => setShowFilters(false)}>
                                <FiX />
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="filter-group">
                            <h4 className="filter-title">Category</h4>
                            <div className="filter-options">
                                <button
                                    className={`filter-option ${!currentCategory ? 'active' : ''}`}
                                    onClick={() => updateFilters('category', '')}
                                >
                                    All Categories
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        className={`filter-option ${currentCategory === category ? 'active' : ''}`}
                                        onClick={() => updateFilters('category', category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="filter-group">
                            <h4 className="filter-title">Price Range</h4>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={currentMinPrice}
                                    onChange={(e) => updateFilters('minPrice', e.target.value)}
                                    className="form-input"
                                />
                                <span>—</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={currentMaxPrice}
                                    onChange={(e) => updateFilters('maxPrice', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <button className="btn btn-secondary" onClick={clearFilters}>
                                Clear All Filters
                            </button>
                        )}
                    </aside>

                    {/* Products Grid */}
                    <div className="products-main">
                        {/* Toolbar */}
                        <div className="products-toolbar">
                            <button
                                className="btn btn-secondary filters-toggle"
                                onClick={() => setShowFilters(true)}
                            >
                                <FiFilter /> Filters
                            </button>

                            <div className="sort-dropdown">
                                <select
                                    value={currentSort}
                                    onChange={(e) => updateFilters('sort', e.target.value)}
                                    className="form-input"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <FiChevronDown className="dropdown-icon" />
                            </div>
                        </div>

                        {/* Products */}
                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📦</div>
                                <h2 className="empty-state-title">No products found</h2>
                                <p className="empty-state-text">
                                    Try adjusting your search or filter criteria
                                </p>
                                <button className="btn btn-primary" onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="products-grid grid-3">
                                    {products.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="pagination">
                                        <button
                                            className="btn btn-secondary"
                                            disabled={currentPage === 1}
                                            onClick={() => updateFilters('page', currentPage - 1)}
                                        >
                                            Previous
                                        </button>
                                        <span className="pagination-info">
                                            Page {pagination.page} of {pagination.pages}
                                        </span>
                                        <button
                                            className="btn btn-secondary"
                                            disabled={currentPage === pagination.pages}
                                            onClick={() => updateFilters('page', currentPage + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
