/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { Product } from '@/models/v3/Product';
import { Review } from '@/models/v3/Review';
import { Category } from '@/models/v3/Category';
import { DigitalInventory } from '@/models/v3/DigitalInventory';

export interface ProductWithReviewStats {
  _id: string;
  title: string;
  description: string;
  sellerId: Types.ObjectId;
  categoryId: Types.ObjectId;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  images: string[];
  status: 'active' | 'draft';
  rating: number;
  reviewStats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      '1': number;
      '2': number;
      '3': number;
      '4': number;
      '5': number;
    };
    lastUpdated: Date;
  };
  _stock?: number;
  stock?: number;
  category?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductService {
  /**
   * Get products with embedded review stats (OPTIMIZED)
   * This replaces individual review API calls
   */
  static async getProductsWithReviewStats(
    sellerId: string,
    options: {
      categoryId?: string;
      status?: 'active' | 'draft';
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<ProductWithReviewStats[]> {
    try {
      const { categoryId, status, limit, skip } = options;

      // Build query
      const query: any = { sellerId: new Types.ObjectId(sellerId) };
      if (categoryId) query.categoryId = new Types.ObjectId(categoryId);
      if (status) query.status = status;

      // Get products with review stats already embedded
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .limit(limit || 50)
        .skip(skip || 0)
        .lean();

      // Get categories and stock info in parallel
      const productsWithDetails = await Promise.all(
        products.map(async (product: any) => {
          const [category, stockCount] = await Promise.all([
            Category.findById(product.categoryId).lean(),
            DigitalInventory.countDocuments({ productId: product._id }),
          ]);

          return {
            ...product,
            stock: stockCount,
            category,
          } as ProductWithReviewStats;
        })
      );

      return productsWithDetails;
    } catch (error) {
      console.error('Error fetching products with review stats:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get single product with review stats
   */
  static async getProductWithReviewStats(
    productId: string,
    sellerId?: string
  ): Promise<ProductWithReviewStats | null> {
    try {
      const query: any = { _id: new Types.ObjectId(productId) };
      if (sellerId) query.sellerId = new Types.ObjectId(sellerId);

      const product = await Product.findOne(query).lean();
      if (!product) return null;

      const [category, stockCount] = await Promise.all([
        Category.findById((product as any).categoryId).lean(),
        DigitalInventory.countDocuments({ productId: (product as any)._id }),
      ]);

      return {
        ...product,
        stock: stockCount,
        category,
      } as unknown as ProductWithReviewStats;
    } catch (error) {
      console.error('Error fetching product with review stats:', error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Update review stats for a product (called when reviews change)
   */
  static async updateProductReviewStats(productId: string): Promise<void> {
    try {
      const objectId = new Types.ObjectId(productId);

      // Calculate review stats using aggregation pipeline
      const stats = await Review.aggregate([
        {
          $match: {
            productId: objectId,
            reviewType: 'product',
            status: 'active',
          },
        },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            ratings: { $push: '$rating' },
          },
        },
      ]);

      const reviewStats = {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0,
        },
        lastUpdated: new Date(),
      };

      if (stats.length > 0) {
        const stat = stats[0];
        reviewStats.averageRating = Math.round(stat.averageRating * 10) / 10; // Round to 1 decimal
        reviewStats.totalReviews = stat.totalReviews;

        // Calculate rating distribution
        stat.ratings.forEach((rating: number) => {
          reviewStats.ratingDistribution[
            rating.toString() as keyof typeof reviewStats.ratingDistribution
          ]++;
        });
      }

      // Update product with new review stats
      await Product.findByIdAndUpdate(
        objectId,
        {
          $set: {
            reviewStats,
            rating: reviewStats.averageRating, // Keep legacy rating field for compatibility
          },
        },
        { new: true }
      );

      console.log(`Updated review stats for product ${productId}:`, reviewStats);
    } catch (error) {
      console.error('Error updating product review stats:', error);
      throw new Error('Failed to update product review stats');
    }
  }

  /**
   * Batch update review stats for multiple products
   */
  static async batchUpdateReviewStats(productIds: string[]): Promise<void> {
    try {
      const updatePromises = productIds.map((productId) =>
        this.updateProductReviewStats(productId)
      );

      await Promise.all(updatePromises);
      console.log(`Batch updated review stats for ${productIds.length} products`);
    } catch (error) {
      console.error('Error batch updating review stats:', error);
      throw new Error('Failed to batch update review stats');
    }
  }

  /**
   * Initialize review stats for existing products (migration helper)
   */
  static async initializeAllProductReviewStats(): Promise<void> {
    try {
      console.log('Starting review stats initialization for all products...');

      // Get all product IDs
      const products = await Product.find({}, { _id: 1 }).lean();
      const productIds = products.map((p: any) => p._id.toString());

      console.log(`Found ${productIds.length} products to initialize`);

      // Process in batches of 10 to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < productIds.length; i += batchSize) {
        const batch = productIds.slice(i, i + batchSize);
        await this.batchUpdateReviewStats(batch);
        console.log(
          `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            productIds.length / batchSize
          )}`
        );

        // Small delay to prevent database overload
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log('Review stats initialization completed!');
    } catch (error) {
      console.error('Error initializing product review stats:', error);
      throw new Error('Failed to initialize product review stats');
    }
  }

  /**
   * Get products for public store (optimized for buyers)
   */
  static async getPublicStoreProducts(
    sellerId: string,
    options: {
      categoryId?: string;
      limit?: number;
      skip?: number;
      search?: string;
    } = {}
  ): Promise<ProductWithReviewStats[]> {
    try {
      const { categoryId, limit, skip, search } = options;

      // Build query for active products only
      const query: any = {
        sellerId: new Types.ObjectId(sellerId),
        status: 'active',
      };

      if (categoryId) query.categoryId = new Types.ObjectId(categoryId);

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Get products with embedded review stats
      const products = await Product.find(query)
        .sort({ 'reviewStats.averageRating': -1, createdAt: -1 }) // Sort by rating first
        .limit(limit || 20)
        .skip(skip || 0)
        .lean();

      // Get categories and stock info
      const productsWithDetails = await Promise.all(
        products.map(async (product: any) => {
          const [category, stockCount] = await Promise.all([
            Category.findById(product.categoryId).lean(),
            DigitalInventory.countDocuments({ productId: product._id }),
          ]);

          return {
            ...product,
            stock: stockCount,
            category,
          } as ProductWithReviewStats;
        })
      );

      return productsWithDetails;
    } catch (error) {
      console.error('Error fetching public store products:', error);
      throw new Error('Failed to fetch store products');
    }
  }
}
