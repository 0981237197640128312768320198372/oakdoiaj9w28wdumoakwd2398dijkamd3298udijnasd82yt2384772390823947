import { Types } from 'mongoose';
import { StoreCredit, IStoreCredit } from '../../models/v3/StoreCredit';
import { Order } from '../../models/v3/Order';

export interface StoreCreditData {
  buyerId: string;
  sellerId: string;
  creditType: 'positive' | 'negative';
}

export interface StoreCreditStats {
  positiveCount: number;
  negativeCount: number;
  totalCount: number;
  positivePercentage: number;
}

export class StoreCreditService {
  /**
   * Check if buyer has ever purchased from seller
   */
  static async hasPurchasedFromSeller(buyerId: string, sellerId: string): Promise<boolean> {
    try {
      const buyerObjectId = new Types.ObjectId(buyerId);
      const sellerObjectId = new Types.ObjectId(sellerId);

      const orderCount = await Order.countDocuments({
        buyerId: buyerObjectId,
        sellerId: sellerObjectId,
        status: 'completed',
      });

      return orderCount > 0;
    } catch (error) {
      console.error('Error checking purchase history:', error);
      return false;
    }
  }

  /**
   * Get purchase summary between buyer and seller
   */
  static async getPurchaseSummary(buyerId: string, sellerId: string) {
    try {
      const buyerObjectId = new Types.ObjectId(buyerId);
      const sellerObjectId = new Types.ObjectId(sellerId);

      const result = await Order.aggregate([
        {
          $match: {
            buyerId: buyerObjectId,
            sellerId: sellerObjectId,
            status: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: '$total' },
            firstPurchase: { $min: '$createdAt' },
            lastPurchase: { $max: '$createdAt' },
          },
        },
      ]);

      return (
        result[0] || {
          totalOrders: 0,
          totalAmount: 0,
          firstPurchase: null,
          lastPurchase: null,
        }
      );
    } catch (error) {
      console.error('Error getting purchase summary:', error);
      return {
        totalOrders: 0,
        totalAmount: 0,
        firstPurchase: null,
        lastPurchase: null,
      };
    }
  }

  /**
   * Submit or update store credit
   */
  static async submitStoreCredit(data: StoreCreditData): Promise<IStoreCredit> {
    try {
      const { buyerId, sellerId, creditType } = data;

      // Validate input
      if (!buyerId || !sellerId || !creditType) {
        throw new Error('Missing required fields');
      }

      if (!['positive', 'negative'].includes(creditType)) {
        throw new Error('Invalid credit type');
      }

      // Check if buyer has purchased from seller
      const hasPurchased = await this.hasPurchasedFromSeller(buyerId, sellerId);
      if (!hasPurchased) {
        throw new Error('You must purchase from this store before giving credit');
      }

      const buyerObjectId = new Types.ObjectId(buyerId);
      const sellerObjectId = new Types.ObjectId(sellerId);

      // Use upsert to either create new or update existing credit
      const credit = await StoreCredit.findOneAndUpdate(
        {
          buyerId: buyerObjectId,
          sellerId: sellerObjectId,
        },
        {
          creditType,
          updatedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      return credit;
    } catch (error) {
      console.error('Error submitting store credit:', error);
      throw error;
    }
  }

  /**
   * Get store credit statistics
   */
  static async getStoreCreditStats(sellerId: string): Promise<StoreCreditStats> {
    try {
      const sellerObjectId = new Types.ObjectId(sellerId);
      return await StoreCredit.getCreditStats(sellerObjectId);
    } catch (error) {
      console.error('Error fetching store credit stats:', error);
      return {
        positiveCount: 0,
        negativeCount: 0,
        totalCount: 0,
        positivePercentage: 0,
      };
    }
  }

  /**
   * Get user's credit for a specific store
   */
  static async getUserStoreCredit(buyerId: string, sellerId: string): Promise<IStoreCredit | null> {
    try {
      const buyerObjectId = new Types.ObjectId(buyerId);
      const sellerObjectId = new Types.ObjectId(sellerId);

      return await StoreCredit.getUserCredit(buyerObjectId, sellerObjectId);
    } catch (error) {
      console.error('Error fetching user store credit:', error);
      return null;
    }
  }

  /**
   * Remove store credit
   */
  static async removeStoreCredit(buyerId: string, sellerId: string): Promise<boolean> {
    try {
      const buyerObjectId = new Types.ObjectId(buyerId);
      const sellerObjectId = new Types.ObjectId(sellerId);

      const result = await StoreCredit.findOneAndDelete({
        buyerId: buyerObjectId,
        sellerId: sellerObjectId,
      });

      return result !== null;
    } catch (error) {
      console.error('Error removing store credit:', error);
      return false;
    }
  }

  /**
   * Get recent store credits for a seller (for display purposes)
   */
  static async getRecentStoreCredits(
    sellerId: string,
    options: { limit?: number; creditType?: 'positive' | 'negative' } = {}
  ): Promise<IStoreCredit[]> {
    try {
      const { limit = 10, creditType } = options;
      const sellerObjectId = new Types.ObjectId(sellerId);

      const query: { sellerId: Types.ObjectId; creditType?: 'positive' | 'negative' } = {
        sellerId: sellerObjectId,
      };
      if (creditType) {
        query.creditType = creditType;
      }

      return await StoreCredit.find(query)
        .populate('buyerId', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Error fetching recent store credits:', error);
      return [];
    }
  }
}
