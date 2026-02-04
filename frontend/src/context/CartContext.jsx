import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load cart from API or localStorage
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            // Load from localStorage for guests
            const savedCart = localStorage.getItem('guestCart');
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        }
    }, [isAuthenticated]);

    // Save guest cart to localStorage
    useEffect(() => {
        if (!isAuthenticated && cart.length > 0) {
            localStorage.setItem('guestCart', JSON.stringify(cart));
        }
    }, [cart, isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/cart');
            setCart(data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        try {
            if (isAuthenticated) {
                const { data } = await api.post('/cart', { productId: product._id, quantity });
                setCart(data);
            } else {
                // Guest cart
                setCart(prev => {
                    const existing = prev.find(item => item.product._id === product._id);
                    if (existing) {
                        return prev.map(item =>
                            item.product._id === product._id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );
                    }
                    return [...prev, { product, quantity, _id: Date.now().toString() }];
                });
            }
            toast.success('Added to cart!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            if (isAuthenticated) {
                const { data } = await api.put(`/cart/${itemId}`, { quantity });
                setCart(data);
            } else {
                if (quantity <= 0) {
                    setCart(prev => prev.filter(item => item._id !== itemId));
                } else {
                    setCart(prev =>
                        prev.map(item =>
                            item._id === itemId ? { ...item, quantity } : item
                        )
                    );
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update cart');
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            if (isAuthenticated) {
                const { data } = await api.delete(`/cart/${itemId}`);
                setCart(data);
            } else {
                setCart(prev => prev.filter(item => item._id !== itemId));
            }
            toast.success('Removed from cart');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove item');
        }
    };

    const clearCart = async () => {
        try {
            if (isAuthenticated) {
                await api.delete('/cart');
            } else {
                localStorage.removeItem('guestCart');
            }
            setCart([]);
        } catch (error) {
            toast.error('Failed to clear cart');
        }
    };

    const cartTotal = cart.reduce(
        (total, item) => total + (item.product?.price || 0) * item.quantity,
        0
    );

    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    const value = {
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        fetchCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
