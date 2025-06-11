import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/v3/Order';
import { Product } from '@/models/v3/Product';
import { Balance } from '@/models/v3/Balance';
import { Transaction } from '@/models/v3/Transaction';
import { Types } from 'mongoose';

interface OrderForCancellation {
  _id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  items: Array<{
    productId: { _id: string };
    quantity: number;
  }>;
  totals: { total: number };
  expiresAt: Date;
}

export class OrderExpirationService {
  private static instance: OrderExpirationService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  private constructor() {}

  static getInstance(): OrderExpirationService {
    if (!OrderExpirationService.instance) {
      OrderExpirationService.instance = new OrderExpirationService();
    }
    return OrderExpirationService.instance;
  }

  /**
   * Start the order expiration monitoring service
   * Runs every 30 seconds to check for expired orders
   */
  start(): void {
    if (this.isRunning) {
      console.log('Order expiration service is already running');
      return;
    }

    console.log('Starting order expiration service...');
    this.isRunning = true;

    // Run immediately on start
    this.processExpiredOrders().catch(console.error);

    // Then run every 30 seconds
    this.intervalId = setInterval(() => {
      this.processExpiredOrders().catch(console.error);
    }, 30 * 1000); // 30 seconds

    console.log('Order expiration service started');
  }

  /**
   * Stop the order expiration monitoring service
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Order expiration service is not running');
      return;
    }

    console.log('Stopping order expiration service...');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('Order expiration service stopped');
  }

  /**
   * Check if the service is currently running
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Process all expired orders
   * This is the main function that handles order cancellation
   */
  private async processExpiredOrders(): Promise<void> {
    try {
      await connectToDatabase();

      // Find all expired pending orders (both pending and confirmed can expire)
      const expiredOrders = await Order.find({
        status: { $in: ['pending', 'confirmed'] },
        expiresAt: { $lt: new Date() },
      }).populate('items.productId');

      if (expiredOrders.length === 0) {
        return; // No expired orders to process
      }

      console.log(`Processing ${expiredOrders.length} expired orders...`);

      for (const order of expiredOrders) {
        try {
          await this.cancelExpiredOrder(order);
        } catch (error) {
          console.error(`Failed to cancel expired order ${order.orderId}:`, error);
        }
      }

      console.log(`Processed ${expiredOrders.length} expired orders`);
    } catch (error) {
      console.error('Error processing expired orders:', error);
    }
  }

  /**
   * Cancel a single expired order
   * Restores stock and refunds balance
   */
  private async cancelExpiredOrder(order: unknown): Promise<void> {
    const typedOrder = order as OrderForCancellation;
    console.log(`Cancelling expired order: ${typedOrder.orderId}`);

    try {
      // 1. Restore product stock
      for (const item of typedOrder.items) {
        await Product.findByIdAndUpdate(item.productId._id, { $inc: { _stock: item.quantity } });
      }

      // 2. Refund buyer balance from reserved back to wallet
      const reservedBalance = await Balance.findOne({
        buyerId: new Types.ObjectId(typedOrder.buyerId),
        balanceType: 'reserved',
      });

      if (reservedBalance && reservedBalance.amount >= typedOrder.totals.total) {
        // Move from reserved back to wallet
        await Balance.updateBalance(
          new Types.ObjectId(typedOrder.buyerId),
          'buyer',
          typedOrder.totals.total,
          'reserved',
          'subtract'
        );

        await Balance.updateBalance(
          new Types.ObjectId(typedOrder.buyerId),
          'buyer',
          typedOrder.totals.total,
          'wallet',
          'add'
        );

        // 3. Create refund transaction record
        await Transaction.createDepositTransaction(
          new Types.ObjectId(typedOrder.buyerId),
          typedOrder.totals.total,
          'balance',
          `REFUND-${typedOrder.orderId}`,
          {
            type: 'refund',
            reason: 'order_expired',
            originalOrderId: typedOrder._id,
          }
        );
      }

      // 4. Update order status
      await Order.findByIdAndUpdate(typedOrder._id, {
        status: 'cancelled',
        cancelledAt: new Date(),
      });

      // 5. Send notification to seller (optional)
      this.notifySellerOrderCancelled(typedOrder).catch(console.error);

      console.log(`Successfully cancelled expired order: ${typedOrder.orderId}`);
    } catch (error) {
      console.error(`Error cancelling order ${typedOrder.orderId}:`, error);
      throw error;
    }
  }

  /**
   * Send LINE notification to seller about cancelled order
   */
  private async notifySellerOrderCancelled(order: unknown): Promise<void> {
    try {
      const typedOrder = order as OrderForCancellation;

      // Get seller information
      const seller = await Order.findById(typedOrder._id).populate(
        'sellerId',
        'contact.line username'
      );

      if (!seller || !(seller.sellerId as { contact?: { line?: string } })?.contact?.line) {
        return; // No LINE contact configured
      }

      const message = `❌ คำสั่งซื้อหมดอายุ
📋 Order ID: ${typedOrder.orderId}
💰 ยอดเงิน: ${typedOrder.totals.total.toLocaleString()} เหรียญ
📦 สินค้า: ${typedOrder.items.length} รายการ
⏰ หมดอายุเมื่อ: ${typedOrder.expiresAt.toLocaleString('th-TH')}`;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v3/line/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: (seller.sellerId as unknown as { contact: { line: string } }).contact.line,
          message,
        }),
      });
    } catch (error) {
      console.error('Error sending cancellation notification:', error);
    }
  }

  /**
   * Manual method to process expired orders (for testing or manual triggers)
   */
  async manualProcessExpiredOrders(): Promise<{ processed: number; errors: number }> {
    let processed = 0;
    let errors = 0;

    try {
      await connectToDatabase();

      const expiredOrders = await Order.find({
        status: 'pending',
        expiresAt: { $lt: new Date() },
      }).populate('items.productId');

      for (const order of expiredOrders) {
        try {
          await this.cancelExpiredOrder(order);
          processed++;
        } catch (error) {
          console.error(`Failed to cancel order ${order.orderId}:`, error);
          errors++;
        }
      }
    } catch (error) {
      console.error('Error in manual processing:', error);
      errors++;
    }

    return { processed, errors };
  }

  /**
   * Get service status and statistics
   */
  async getServiceStatus(): Promise<{
    isRunning: boolean;
    pendingOrders: number;
    expiredOrders: number;
    nextCheck?: Date;
  }> {
    try {
      await connectToDatabase();

      const [pendingOrders, expiredOrders] = await Promise.all([
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({
          status: 'pending',
          expiresAt: { $lt: new Date() },
        }),
      ]);

      return {
        isRunning: this.isRunning,
        pendingOrders,
        expiredOrders,
        nextCheck: this.isRunning ? new Date(Date.now() + 30000) : undefined,
      };
    } catch (error) {
      console.error('Error getting service status:', error);
      return {
        isRunning: this.isRunning,
        pendingOrders: 0,
        expiredOrders: 0,
      };
    }
  }
}

// Export singleton instance
export const orderExpirationService = OrderExpirationService.getInstance();
