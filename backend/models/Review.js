import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        rating: {
            type: Number,
            required: [true, 'Please add a rating'],
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        comment: {
            type: String,
            required: [true, 'Please add a comment'],
            maxlength: [1000, 'Comment cannot be more than 1000 characters'],
        },
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },
        helpful: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent user from submitting more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for getting reviews by product
reviewSchema.index({ product: 1, createdAt: -1 });

// Static method to calculate average rating for a product
reviewSchema.statics.calcAverageRating = async function (productId) {
    const stats = await this.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: '$product',
                numReviews: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    try {
        if (stats.length > 0) {
            await mongoose.model('Product').findByIdAndUpdate(productId, {
                rating: Math.round(stats[0].avgRating * 10) / 10,
                numReviews: stats[0].numReviews,
            });
        } else {
            await mongoose.model('Product').findByIdAndUpdate(productId, {
                rating: 0,
                numReviews: 0,
            });
        }
    } catch (err) {
        console.error(err);
    }
};

// Update product rating after save
reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.product);
});

// Update product rating after remove
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await doc.constructor.calcAverageRating(doc.product);
    }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
