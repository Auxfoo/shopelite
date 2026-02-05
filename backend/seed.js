import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const sampleProducts = [
    {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life. Features deep bass, comfortable ear cushions, and built-in microphone for calls.',
        price: 149.99,
        comparePrice: 199.99,
        category: 'Electronics',
        brand: 'AudioTech',
        stock: 50,
        images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', alt: 'Headphones' }],
        thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        rating: 4.5,
        numReviews: 128,
        featured: true,
        tags: ['wireless', 'bluetooth', 'noise-cancelling'],
    },
    {
        name: 'Smart Watch Pro',
        description: 'Advanced smartwatch with heart rate monitoring, GPS tracking, and 7-day battery life. Water-resistant up to 50 meters.',
        price: 299.99,
        comparePrice: 349.99,
        category: 'Electronics',
        brand: 'TechWear',
        stock: 35,
        images: [{ url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80', alt: 'Smart Watch' }],
        thumbnail: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
        rating: 4.7,
        numReviews: 89,
        featured: true,
        tags: ['smartwatch', 'fitness', 'health'],
    },
    {
        name: 'Premium Leather Backpack',
        description: 'Handcrafted genuine leather backpack with laptop compartment. Perfect for work or travel with multiple pockets and vintage design.',
        price: 189.99,
        comparePrice: 249.99,
        category: 'Clothing',
        brand: 'LeatherCraft',
        stock: 25,
        images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', alt: 'Leather Backpack' }],
        thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
        rating: 4.8,
        numReviews: 67,
        featured: true,
        tags: ['leather', 'backpack', 'travel'],
    },
    {
        name: 'Premium Coffee Maker',
        description: 'Professional-grade espresso machine with built-in grinder. Makes cafe-quality coffee at home with programmable settings.',
        price: 249.99,
        comparePrice: 349.99,
        category: 'Home & Garden',
        brand: 'BrewMaster',
        stock: 30,
        images: [{ url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80', alt: 'Coffee Maker' }],
        thumbnail: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&q=80',
        rating: 4.6,
        numReviews: 234,
        featured: false,
        tags: ['coffee', 'espresso', 'kitchen'],
    },
    {
        name: 'Yoga Mat Premium',
        description: 'Extra thick 6mm yoga mat with non-slip surface. Eco-friendly TPE material, perfect for yoga, pilates, and stretching.',
        price: 39.99,
        comparePrice: 49.99,
        category: 'Sports & Outdoors',
        brand: 'FlexFit',
        stock: 75,
        images: [{ url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80', alt: 'Yoga Mat' }],
        thumbnail: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80',
        rating: 4.4,
        numReviews: 156,
        featured: true,
        tags: ['yoga', 'fitness', 'eco-friendly'],
    },
    {
        name: 'Minimalist Desk Lamp',
        description: 'Modern LED desk lamp with adjustable brightness and color temperature. USB charging port and touch controls.',
        price: 79.99,
        comparePrice: 99.99,
        category: 'Home & Garden',
        brand: 'LightDesign',
        stock: 40,
        images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', alt: 'Desk Lamp' }],
        thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
        rating: 4.3,
        numReviews: 78,
        featured: false,
        tags: ['lamp', 'led', 'modern'],
    },
    {
        name: 'Noise Cancelling Earbuds',
        description: 'True wireless earbuds with active noise cancellation. 24-hour battery with case, IPX5 water resistant.',
        price: 179.99,
        comparePrice: 229.99,
        category: 'Electronics',
        brand: 'AudioTech',
        stock: 65,
        images: [{ url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', alt: 'Earbuds' }],
        thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
        rating: 4.7,
        numReviews: 312,
        featured: true,
        tags: ['earbuds', 'wireless', 'noise-cancelling'],
    },
    {
        name: 'Professional Camera Backpack',
        description: 'Weather-sealed camera bag with customizable dividers. Fits DSLR with lens attached, laptop sleeve, tripod holder.',
        price: 149.99,
        comparePrice: 199.99,
        category: 'Electronics',
        brand: 'PhotoPro',
        stock: 22,
        images: [{ url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80', alt: 'Camera Backpack' }],
        thumbnail: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80',
        rating: 4.5,
        numReviews: 95,
        featured: false,
        tags: ['camera', 'backpack', 'photography'],
    },
    {
        name: 'Sterling Silver Necklace',
        description: 'Elegant sterling silver pendant necklace with cubic zirconia stones. 18-inch chain with adjustable length. Gift box included.',
        price: 129.99,
        comparePrice: 179.99,
        category: 'Jewelry',
        brand: 'SilverCraft',
        stock: 20,
        images: [{ url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', alt: 'Necklace' }],
        thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
        rating: 4.7,
        numReviews: 43,
        featured: true,
        tags: ['jewelry', 'silver', 'necklace'],
    },
    {
        name: 'Skincare Gift Set',
        description: 'Complete skincare routine set with cleanser, toner, serum, and moisturizer. All-natural ingredients suitable for all skin types.',
        price: 95.99,
        comparePrice: 130.00,
        category: 'Health & Beauty',
        brand: 'PureGlow',
        stock: 45,
        images: [{ url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80', alt: 'Skincare Set' }],
        thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
        rating: 4.6,
        numReviews: 189,
        featured: false,
        tags: ['skincare', 'beauty', 'natural'],
    },
    {
        name: 'Portable Bluetooth Speaker',
        description: 'Waterproof portable speaker with 360° sound. 20-hour battery, built-in microphone, pairs with 2 speakers for stereo.',
        price: 89.99,
        comparePrice: 119.99,
        category: 'Electronics',
        brand: 'SoundWave',
        stock: 55,
        images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', alt: 'Bluetooth Speaker' }],
        thumbnail: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
        rating: 4.8,
        numReviews: 267,
        featured: true,
        tags: ['speaker', 'bluetooth', 'portable'],
    },
    {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB mechanical keyboard with Cherry MX switches. Programmable keys, dedicated media controls, and aluminum frame.',
        price: 159.99,
        comparePrice: 199.99,
        category: 'Electronics',
        brand: 'GameGear',
        stock: 28,
        images: [{ url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80', alt: 'Gaming Keyboard' }],
        thumbnail: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80',
        rating: 4.5,
        numReviews: 145,
        featured: false,
        tags: ['gaming', 'keyboard', 'mechanical'],
    },
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});

        console.log('Cleared existing data');

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
        });

        console.log('Created admin user: admin@example.com / admin123');

        // Create regular user
        const regularUser = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'user',
        });

        console.log('Created regular user: john@example.com / password123');

        // Create products
        await Product.insertMany(sampleProducts);
        console.log(`Created ${sampleProducts.length} sample products`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest Credentials:');
        console.log('Admin: admin@example.com / admin123');
        console.log('User: john@example.com / password123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
