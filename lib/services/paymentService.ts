import { Types } from 'mongoose';
import Stripe from 'stripe';
import { Payment, IPayment } from '@/models/v3/Payment';
import { Balance } from '@/models/v3/Balance';
import { connectToDatabase } from '@/lib/db';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

export class PaymentService {
  /**
   * Create a payment intent with PromptPay and generate QR code
   */
  static async createPayment(
    buyerId: string | Types.ObjectId,
    amount: number,
    email: string
  ): Promise<{
    paymentIntentId: string;
    qrCodeData: string;
    amount: number;
  }> {
    if (amount < 10) {
      throw new Error('Minimum deposit amount is 10 THB');
    }

    // Ensure database connection
    await connectToDatabase();

    // Convert buyerId to ObjectId if it's a string
    const buyerIdObj = typeof buyerId === 'string' ? new Types.ObjectId(buyerId) : buyerId;

    try {
      // Create a payment intent with PromptPay
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'thb',
        payment_method_types: ['promptpay'],
        metadata: {
          buyerId: buyerIdObj.toString(),
          amount: amount.toString(),
        },
      });

      // Confirm the payment intent to generate the QR code
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method_data: {
          type: 'promptpay',
          billing_details: {
            email,
          },
        },
      });

      // Extract QR code data
      const qrCodeData = confirmedPaymentIntent.next_action?.promptpay_display_qr_code?.data || '';

      if (!qrCodeData) {
        throw new Error('Failed to generate QR code');
      }

      // Create a payment record in the database
      const payment = new Payment({
        paymentIntentId: confirmedPaymentIntent.id,
        buyerId: buyerIdObj,
        amount,
        status: confirmedPaymentIntent.status,
        currency: 'THB',
        paymentMethod: 'promptpay',
        metadata: {
          email,
          qrCodeData,
        },
      });

      await payment.save();

      return {
        paymentIntentId: confirmedPaymentIntent.id,
        qrCodeData,
        amount,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Check the status of a payment
   */
  static async checkPaymentStatus(paymentIntentId: string): Promise<{
    status: string;
    payment?: IPayment;
  }> {
    try {
      // Ensure database connection
      await connectToDatabase();

      // Check Stripe for the latest status
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Find the payment in our database
      const payment = await Payment.findOne({ paymentIntentId });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update the payment status if it has changed
      if (payment.status !== paymentIntent.status) {
        payment.status = paymentIntent.status as
          | 'pending'
          | 'processing'
          | 'succeeded'
          | 'failed'
          | 'canceled';

        // If payment is successful, update the completed timestamp
        if (paymentIntent.status === 'succeeded' && !payment.completedAt) {
          payment.completedAt = new Date();
        }

        await payment.save();
      }

      return {
        status: paymentIntent.status,
        payment,
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  /**
   * Cancel a payment
   */
  static async cancelPayment(
    paymentIntentId: string
  ): Promise<{ success: boolean; status: string }> {
    try {
      // Ensure database connection
      await connectToDatabase();

      // Cancel the payment intent in Stripe
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
        cancellation_reason: 'requested_by_customer',
      });

      // Update the payment in our database
      const payment = await Payment.findOne({ paymentIntentId });
      if (payment) {
        payment.status = 'canceled';
        await payment.save();
      }

      return {
        success: true,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Error canceling payment:', error);
      throw error;
    }
  }

  /**
   * Complete a payment and update the buyer's balance
   */
  static async completePayment(
    paymentIntentId: string,
    status: 'succeeded' | 'failed' | 'canceled'
  ): Promise<{
    success: boolean;
    payment: IPayment;
  }> {
    try {
      // Ensure database connection
      await connectToDatabase();

      // Find the payment in our database
      const payment = await Payment.findOne({ paymentIntentId });
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update the payment status
      payment.status = status;

      // If payment is successful, update the buyer's balance
      if (status === 'succeeded' && !payment.completedAt) {
        payment.completedAt = new Date();

        // Update the buyer's balance
        const balance = await Balance.findOrCreateBalance(payment.buyerId, 'buyer', 'wallet');
        balance.amount += payment.amount;
        balance.lastUpdated = new Date();
        await balance.save();
      }

      await payment.save();

      return {
        success: true,
        payment,
      };
    } catch (error) {
      console.error('Error completing payment:', error);
      throw error;
    }
  }

  /**
   * Get payment history for a buyer
   */
  static async getPaymentHistory(
    buyerId: string | Types.ObjectId,
    options: {
      limit?: number;
      skip?: number;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<{
    payments: IPayment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      // Ensure database connection
      await connectToDatabase();

      const { limit = 10, skip = 0, status, startDate, endDate } = options;

      // Convert buyerId to ObjectId if it's a string
      const buyerIdObj = typeof buyerId === 'string' ? new Types.ObjectId(buyerId) : buyerId;

      // Build the query
      interface QueryType {
        buyerId: Types.ObjectId;
        status?: string;
        createdAt?: {
          $gte?: Date;
          $lte?: Date;
        };
      }

      const query: QueryType = { buyerId: buyerIdObj };

      if (status) {
        query.status = status;
      }

      if (startDate || endDate) {
        query.createdAt = {};

        if (startDate) {
          query.createdAt.$gte = startDate;
        }

        if (endDate) {
          query.createdAt.$lte = endDate;
        }
      }

      // Get the payments
      const payments = await Payment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

      // Get the total count
      const total = await Payment.countDocuments(query);

      return {
        payments,
        total,
        page: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }
}
