/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { PendingReview, IPendingReview } from '../../models/v3/PendingReview';
import { Review, IReview } from '../../models/v3/Review';
import { IOrder } from '../../models/v3/Order';
// Import models to ensure they're registered for population
import '../../models/User';
import '../../models/Seller';
import '../../models/v3/Product';
import '../../models/v3/Order';

export interface CreateReviewData {
  orderId: string;
  buyerId: string;
  reviewType: 'product' | 'seller';
  rating: number;
  comment: string;
  buyerName: string;
  buyerEmail?: string;
  buyerAvatarUrl?: string;
}

export interface CreateStoreReviewData {
  buyerId: string;
  sellerId: string;
  rating: number;
  comment: string;
  buyerName: string;
  buyerEmail?: string;
  buyerAvatarUrl?: string;
}

export interface PendingReviewWithSeller {
  _id: string;
  orderId: Types.ObjectId;
  buyerId: Types.ObjectId;
  productId: Types.ObjectId;
  productTitle: string;
  orderTotal: number;
  reminderCount: number;
  lastRemindedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  sellerId: {
    store: {
      name: string;
      logoUrl?: string;
    };
  };
}

export class ReviewService {
  /**
   * Create pending reviews when an order is completed
   */
  static async createPendingReviews(order: IOrder): Promise<IPendingReview[]> {
    try {
      return await PendingReview.createFromOrder(order);
    } catch (error) {
      console.error('Error creating pending reviews:', error);
      throw new Error('Failed to create pending reviews');
    }
  }

  /**
   * Get pending reviews for a buyer
   */
  static async getPendingReviewsForBuyer(buyerId: string): Promise<PendingReviewWithSeller[]> {
    try {
      const objectId = new Types.ObjectId(buyerId);
      const results = await PendingReview.findPendingForBuyer(objectId);
      return results as any; // Type assertion for populated fields
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      throw new Error('Failed to fetch pending reviews');
    }
  }

  /**
   * Check if buyer has pending reviews (for login prompt)
   */
  static async hasPendingReviews(buyerId: string): Promise<boolean> {
    try {
      const objectId = new Types.ObjectId(buyerId);
      const count = await PendingReview.countDocuments({
        buyerId: objectId,
        expiresAt: { $gt: new Date() },
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking pending reviews:', error);
      return false;
    }
  }

  /**
   * Submit a review (IMPROVED with atomic operations and better duplicate handling)
   */
  static async submitReview(data: CreateReviewData): Promise<IReview> {
    try {
      const {
        orderId,
        buyerId,
        reviewType,
        rating,
        comment,
        buyerName,
        buyerEmail,
        buyerAvatarUrl,
      } = data;

      // Validate input
      if (!orderId || !buyerId || !reviewType || !rating || !comment || !buyerName) {
        throw new Error('Missing required fields');
      }

      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        throw new Error('Rating must be an integer between 1 and 5');
      }

      if (comment.length < 10 || comment.length > 1000) {
        throw new Error('Comment must be between 10 and 1000 characters');
      }

      // SIMPLIFIED: Only allow product reviews
      if (reviewType !== 'product') {
        throw new Error('Only product reviews are allowed');
      }

      // Find the pending review
      const pendingReview = await PendingReview.findOne({
        orderId: new Types.ObjectId(orderId),
        buyerId: new Types.ObjectId(buyerId),
      });

      if (!pendingReview) {
        throw new Error('No pending review found for this order');
      }

      // IMPROVED: Atomic duplicate check and creation
      const existingReview = await Review.findOne({
        orderId: new Types.ObjectId(orderId),
        buyerId: new Types.ObjectId(buyerId),
        reviewType: 'product',
      });

      if (existingReview) {
        throw new Error('Product review already submitted for this order');
      }

      // Create the review with atomic operation and duplicate key handling
      const review = new Review({
        orderId: pendingReview.orderId,
        buyerId: pendingReview.buyerId,
        sellerId: pendingReview.sellerId,
        productId: pendingReview.productId,
        reviewType: 'product', // Always product
        rating,
        comment: comment.trim(),
        // Store buyer information directly in the review
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail?.trim(),
        buyerAvatarUrl: buyerAvatarUrl?.trim(),
      });

      try {
        await review.save();
      } catch (saveError: any) {
        // Handle duplicate key error at save level
        if (saveError.code === 11000 || saveError.message?.includes('E11000')) {
          throw new Error('Review already submitted for this order');
        }
        throw saveError;
      }

      // Remove the pending review after successful product review
      await PendingReview.findByIdAndDelete(pendingReview._id);

      // Update product review stats immediately
      try {
        const { ProductService } = await import('./productService');
        await ProductService.updateProductReviewStats(pendingReview.productId.toString());
      } catch (error) {
        console.error('Error updating product review stats after review submission:', error);
        // Don't throw error here as the review was successfully created
      }

      return review;
    } catch (error) {
      console.error('Error submitting review:', error);

      // Better error handling for duplicate key errors
      if (error instanceof Error && error.message.includes('E11000')) {
        throw new Error('Review already submitted for this order');
      }

      // Handle MongoDB duplicate key error specifically
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        throw new Error('Review already submitted for this order');
      }

      throw error;
    }
  }

  /**
   * Submit a store review (NEW - independent of orders)
   */
  static async submitStoreReview(data: CreateStoreReviewData): Promise<IReview> {
    try {
      const { buyerId, sellerId, rating, comment, buyerName, buyerEmail, buyerAvatarUrl } = data;

      // Validate input
      if (!buyerId || !sellerId || !rating || !comment || !buyerName) {
        throw new Error('Missing required fields (buyerId, sellerId, rating, comment, buyerName)');
      }

      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        throw new Error('Rating must be an integer between 1 and 5');
      }

      if (comment.length < 10 || comment.length > 1000) {
        throw new Error('Comment must be between 10 and 1000 characters');
      }

      // Import StoreCreditService to check purchase history
      const { StoreCreditService } = await import('./storeCreditService');

      // Check if buyer has purchased from seller
      const hasPurchased = await StoreCreditService.hasPurchasedFromSeller(buyerId, sellerId);
      if (!hasPurchased) {
        throw new Error('You must purchase from this store before reviewing it');
      }

      // Check for existing store review
      const existingReview = await Review.findOne({
        buyerId: new Types.ObjectId(buyerId),
        sellerId: new Types.ObjectId(sellerId),
        reviewType: 'seller',
      });

      if (existingReview) {
        throw new Error('Store review already submitted for this seller');
      }

      // Create the store review (no orderId or productId required)
      const review = new Review({
        buyerId: new Types.ObjectId(buyerId),
        sellerId: new Types.ObjectId(sellerId),
        reviewType: 'seller',
        rating,
        comment: comment.trim(),
        // Store buyer information directly in the review
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail?.trim(),
        buyerAvatarUrl: buyerAvatarUrl?.trim(),
      });

      try {
        await review.save();
      } catch (saveError: any) {
        // Handle duplicate key error at save level
        if (saveError.code === 11000 || saveError.message?.includes('E11000')) {
          throw new Error('Store review already submitted for this seller');
        }
        throw saveError;
      }

      return review;
    } catch (error) {
      console.error('Error submitting store review:', error);

      // Better error handling for duplicate key errors
      if (error instanceof Error && error.message.includes('E11000')) {
        throw new Error('Store review already submitted for this seller');
      }

      // Handle MongoDB duplicate key error specifically
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        throw new Error('Store review already submitted for this seller');
      }

      throw error;
    }
  }

  /**
   * Get reviews for a product with enhanced buyer information
   */
  static async getProductReviews(
    productId: string,
    options: { page?: number; limit?: number; sort?: string } = {}
  ): Promise<any[]> {
    try {
      const objectId = new Types.ObjectId(productId);
      const { page = 1, limit = 10, sort = '-createdAt' } = options;
      const skip = (page - 1) * limit;

      const reviews = await Review.find({
        productId: objectId,
        reviewType: 'product',
        status: 'active',
      })
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const enhancedReviews = await Promise.all(
        reviews.map(async (review) => {
          const reviewObj = review.toObject();

          const { Order } = await import('../../models/v3/Order');
          const purchaseCount = await Order.countDocuments({
            buyerId: review.buyerId,
            sellerId: review.sellerId,
            status: 'completed',
          });

          const enhanced = {
            ...reviewObj,
            buyerPurchaseCount: purchaseCount,
            hasBuyerData: !!reviewObj.buyerName,
          };

          return enhanced;
        })
      );

      return enhancedReviews;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw new Error('Failed to fetch product reviews');
    }
  }

  static async getProductRatingStats(productId: string) {
    try {
      const objectId = new Types.ObjectId(productId);
      const result = await Review.getAverageRating(objectId, 'product');
      return result;
    } catch (error) {
      console.error('Error fetching product rating stats:', error);
      throw new Error('Failed to fetch product rating statistics');
    }
  }

  /**
   * Get seller rating statistics (DEPRECATED - keeping for backward compatibility)
   */
  static async getSellerRatingStats(sellerId: string) {
    try {
      const objectId = new Types.ObjectId(sellerId);
      return await Review.getSellerRating(objectId);
    } catch (error) {
      console.error('Error fetching seller rating stats:', error);
      throw new Error('Failed to fetch seller rating statistics');
    }
  }

  /**
   * Get reviews by buyer (SIMPLIFIED - only product reviews)
   */
  static async getBuyerReviews(
    buyerId: string,
    options: { page?: number; limit?: number; reviewType?: 'product' | 'seller' } = {}
  ): Promise<IReview[]> {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const query: any = {
        buyerId: new Types.ObjectId(buyerId),
        reviewType: 'product', // Only product reviews
        status: 'active',
      };

      return await Review.find(query)
        .populate('productId', 'title images')
        .populate('sellerId', 'store.name store.logoUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error fetching buyer reviews:', error);
      throw new Error('Failed to fetch buyer reviews');
    }
  }

  /**
   * Increment reminder count for pending review
   */
  static async incrementReminderCount(pendingReviewId: string): Promise<IPendingReview | null> {
    try {
      const objectId = new Types.ObjectId(pendingReviewId);
      return await PendingReview.incrementReminder(objectId);
    } catch (error) {
      console.error('Error incrementing reminder count:', error);
      return null;
    }
  }

  /**
   * Clean up expired pending reviews (utility function)
   */
  static async cleanupExpiredPendingReviews(): Promise<number> {
    try {
      const result = await PendingReview.deleteMany({
        expiresAt: { $lt: new Date() },
      });
      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error cleaning up expired pending reviews:', error);
      return 0;
    }
  }

  /**
   * Get review statistics for dashboard (SIMPLIFIED)
   */
  static async getReviewStats(buyerId: string) {
    try {
      const objectId = new Types.ObjectId(buyerId);

      const [pendingCount, productReviewCount] = await Promise.all([
        PendingReview.countDocuments({
          buyerId: objectId,
          expiresAt: { $gt: new Date() },
        }),
        Review.countDocuments({
          buyerId: objectId,
          reviewType: 'product',
          status: 'active',
        }),
      ]);

      return {
        pendingReviews: pendingCount,
        productReviews: productReviewCount,
        sellerReviews: 0, // No longer supported
        totalReviews: productReviewCount,
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return {
        pendingReviews: 0,
        productReviews: 0,
        sellerReviews: 0,
        totalReviews: 0,
      };
    }
  }

  /**
   * Get seller reviews (DEPRECATED - keeping for backward compatibility)
   */
  static async getSellerReviews(
    sellerId: string,
    options: { page?: number; limit?: number; sort?: string } = {}
  ): Promise<IReview[]> {
    try {
      const objectId = new Types.ObjectId(sellerId);
      return await Review.findBySeller(objectId, options);
    } catch (error) {
      console.error('Error fetching seller reviews:', error);
      throw new Error('Failed to fetch seller reviews');
    }
  }

  /**
   * Check if buyer can review seller (DEPRECATED - no longer needed)
   */
  static async canReviewSeller(_buyerId: string, _orderId: string): Promise<boolean> {
    // Always return false since seller reviews are disabled
    return false;
  }
}
