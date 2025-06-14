/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/v3/Order';
import { Product } from '@/models/v3/Product';
import { Seller } from '@/models/v3/Seller';
import { Types } from 'mongoose';

export interface SellerStatistics {
  totalProducts: number;
  totalSales: number; // total items sold
  totalRevenue: number; // total money earned
  completedOrders: number;
  averageOrderValue: number;
  lastUpdated: Date;
}

export class SellerStatsService {
  /**
   * Get comprehensive seller statistics
   * @param sellerId - The seller's ObjectId or username
   * @returns Promise<SellerStatistics>
   */
  static async getSellerStatistics(sellerId: string | Types.ObjectId): Promise<SellerStatistics> {
    await connectToDatabase();

    let sellerObjectId: Types.ObjectId;

    // If sellerId is a string (username), we need to find the seller first
    if (typeof sellerId === 'string') {
      const seller = await Seller.findOne({ username: sellerId });
      if (!seller) {
        throw new Error('Seller not found');
      }
      sellerObjectId = seller._id;
    } else {
      sellerObjectId = sellerId;
    }

    // Run all statistics queries in parallel for better performance
    const [orderStats, totalProducts] = await Promise.all([
      this.getOrderStatistics(sellerObjectId),
      this.getTotalProducts(sellerObjectId),
    ]);

    return {
      totalProducts,
      totalSales: orderStats.totalSales,
      totalRevenue: orderStats.totalRevenue,
      completedOrders: orderStats.completedOrders,
      averageOrderValue: orderStats.averageOrderValue,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get order-related statistics using MongoDB aggregation
   * @param sellerId - The seller's ObjectId
   */
  private static async getOrderStatistics(sellerId: Types.ObjectId) {
    const pipeline = [
      {
        $match: {
          sellerId: sellerId,
          status: 'completed', // Only count completed orders
        },
      },
      {
        $group: {
          _id: null,
          completedOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totals.total' },
          totalSales: { $sum: '$metadata.totalQuantity' },
          averageOrderValue: { $avg: '$totals.total' },
        },
      },
    ];

    const result = await Order.aggregate(pipeline);

    if (result.length === 0) {
      return {
        completedOrders: 0,
        totalRevenue: 0,
        totalSales: 0,
        averageOrderValue: 0,
      };
    }

    const stats = result[0];
    return {
      completedOrders: stats.completedOrders || 0,
      totalRevenue: stats.totalRevenue || 0,
      totalSales: stats.totalSales || 0,
      averageOrderValue: stats.averageOrderValue || 0,
    };
  }

  /**
   * Get total products count efficiently
   * @param sellerId - The seller's ObjectId
   */
  private static async getTotalProducts(sellerId: Types.ObjectId): Promise<number> {
    return await Product.countDocuments({ sellerId });
  }

  /**
   * Get recent sales trend (last 30 days)
   * @param sellerId - The seller's ObjectId
   */
  static async getRecentSalesTrend(sellerId: string | Types.ObjectId) {
    await connectToDatabase();

    let sellerObjectId: Types.ObjectId;

    if (typeof sellerId === 'string') {
      const seller = await Seller.findOne({ username: sellerId });
      if (!seller) {
        throw new Error('Seller not found');
      }
      sellerObjectId = seller._id;
    } else {
      sellerObjectId = sellerId;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      {
        $match: {
          sellerId: sellerObjectId,
          status: 'completed',
          completedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$completedAt',
            },
          },
          dailySales: { $sum: '$metadata.totalQuantity' },
          dailyRevenue: { $sum: '$totals.total' },
          dailyOrders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ] as any[];

    return await Order.aggregate(pipeline);
  }

  /**
   * Get top-selling products for a seller
   * @param sellerId - The seller's ObjectId or username
   * @param limit - Number of top products to return
   */
  static async getTopSellingProducts(sellerId: string | Types.ObjectId, limit: number = 5) {
    await connectToDatabase();

    let sellerObjectId: Types.ObjectId;

    if (typeof sellerId === 'string') {
      const seller = await Seller.findOne({ username: sellerId });
      if (!seller) {
        throw new Error('Seller not found');
      }
      sellerObjectId = seller._id;
    } else {
      sellerObjectId = sellerId;
    }

    const pipeline = [
      {
        $match: {
          sellerId: sellerObjectId,
          status: 'completed',
        },
      },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.productId',
          productTitle: { $first: '$items.productTitle' },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
        },
      },
      {
        $sort: { totalQuantitySold: -1 },
      },
      {
        $limit: limit,
      },
    ] as any[];

    return await Order.aggregate(pipeline);
  }
}
