/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Schema, model, Document, Types, Model } from 'mongoose';
// Import User model to ensure it's registered
import User from '../User';

export interface IReview extends Document {
  orderId?: Types.ObjectId; // Optional for store reviews
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  productId?: Types.ObjectId; // Optional for store reviews
  reviewType: 'product' | 'seller';
  rating: number;
  comment: string;
  // Buyer information (denormalized for performance)
  buyerName: string;
  buyerEmail?: string;
  buyerAvatarUrl?: string;
  isPublic: boolean;
  helpfulCount: number;
  reportCount: number;
  status: 'active' | 'hidden' | 'reported' | 'deleted';
  moderationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewModel extends Model<IReview> {
  getAverageRating(productId: Types.ObjectId, reviewType?: 'product' | 'seller'): Promise<any>;
  getSellerRating(sellerId: Types.ObjectId): Promise<any>;
  findByProduct(
    productId: Types.ObjectId,
    options?: { page?: number; limit?: number; sort?: string }
  ): Promise<IReview[]>;
  findBySeller(
    sellerId: Types.ObjectId,
    options?: { page?: number; limit?: number; sort?: string }
  ): Promise<IReview[]>;
}

const reviewSchema = new Schema<IReview>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: function (this: IReview) {
        return this.reviewType === 'product';
      },
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: function (this: IReview) {
        return this.reviewType === 'product';
      },
      index: true,
    },
    reviewType: {
      type: String,
      enum: ['product', 'seller'],
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer between 1 and 5',
      },
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
      trim: true,
    },
    // Buyer information (denormalized for performance)
    buyerName: {
      type: String,
      required: true,
      trim: true,
    },
    buyerEmail: {
      type: String,
      trim: true,
    },
    buyerAvatarUrl: {
      type: String,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'reported', 'deleted'],
      default: 'active',
      index: true,
    },
    moderationNotes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
reviewSchema.index({ productId: 1, reviewType: 1, status: 1, createdAt: -1 });
reviewSchema.index({ sellerId: 1, reviewType: 1, status: 1, createdAt: -1 });
reviewSchema.index({ buyerId: 1, reviewType: 1, createdAt: -1 });

// Unique indexes for different review types
// For product reviews: one review per buyer per order
reviewSchema.index(
  { orderId: 1, buyerId: 1, reviewType: 1 },
  {
    unique: true,
    partialFilterExpression: { reviewType: 'product' },
  }
);

// For store reviews: one review per buyer per seller
reviewSchema.index(
  { sellerId: 1, buyerId: 1, reviewType: 1 },
  {
    unique: true,
    partialFilterExpression: { reviewType: 'seller' },
  }
);

// Static methods
reviewSchema.statics.getAverageRating = async function (
  productId: Types.ObjectId,
  reviewType: 'product' | 'seller' = 'product'
) {
  const matchCondition =
    reviewType === 'product'
      ? { productId, reviewType: 'product', status: 'active' }
      : { productId, reviewType: 'seller', status: 'active' };

  try {
    // Use a single optimized aggregation pipeline
    const result = await this.aggregate([
      { $match: matchCondition },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
              },
            },
          ],
          distribution: [
            {
              $group: {
                _id: '$rating',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    if (!result || result.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0,
        },
      };
    }

    const stats = result[0].stats[0] || { averageRating: 0, totalReviews: 0 };
    const distribution = result[0].distribution || [];

    // Build rating distribution
    const ratingDistribution = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    distribution.forEach((item: any) => {
      if (item._id >= 1 && item._id <= 5) {
        ratingDistribution[item._id.toString() as keyof typeof ratingDistribution] = item.count;
      }
    });

    return {
      averageRating: stats.averageRating || 0,
      totalReviews: stats.totalReviews || 0,
      ratingDistribution,
    };
  } catch (error) {
    console.error('Error in getAverageRating:', error);
    // Return default values on error
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
      },
    };
  }
};

reviewSchema.statics.getSellerRating = async function (sellerId: Types.ObjectId) {
  const result = await this.aggregate([
    { $match: { sellerId, reviewType: 'seller', status: 'active' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { averageRating: 0, totalReviews: 0 };
};

reviewSchema.statics.findByProduct = async function (
  productId: Types.ObjectId,
  options: { page?: number; limit?: number; sort?: string } = {}
) {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  return this.find({ productId, reviewType: 'product', status: 'active' })
    .populate('buyerId', 'name avatarUrl email')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.findBySeller = async function (
  sellerId: Types.ObjectId,
  options: { page?: number; limit?: number; sort?: string } = {}
) {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;
  const skip = (page - 1) * limit;

  return this.find({ sellerId, reviewType: 'seller', status: 'active' })
    .populate('buyerId', 'name avatarUrl')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const Review = model<IReview, IReviewModel>('Review', reviewSchema);
