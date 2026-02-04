import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a product name'],
            trim: true,
            maxlength: [200, 'Name cannot be more than 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [2000, 'Description cannot be more than 2000 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
            min: [0, 'Price cannot be negative'],
        },
        comparePrice: {
            type: Number,
            default: 0,
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
            enum: [
                'Electronics',
                'Clothing',
                'Home & Garden',
                'Sports & Outdoors',
                'Books',
                'Toys & Games',
                'Health & Beauty',
                'Automotive',
                'Jewelry',
                'Food & Grocery',
                'Other',
            ],
        },
        subcategory: {
            type: String,
            default: '',
        },
        brand: {
            type: String,
            default: '',
        },
        stock: {
            type: Number,
            required: [true, 'Please add stock quantity'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        images: [
            {
                url: { type: String, required: true },
                alt: { type: String, default: '' },
            },
        ],
        thumbnail: {
            type: String,
            default: '',
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        tags: [String],
        specifications: [
            {
                name: String,
                value: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.comparePrice > this.price) {
        return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
    }
    return 0;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
