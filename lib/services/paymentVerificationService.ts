import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

export interface PaymentVerificationResult {
  isValid: boolean;
  paymentIntent?: Stripe.PaymentIntent;
  error?: string;
  amount?: number;
  status?: string;
  metadata?: Record<string, string>;
}

export class PaymentVerificationService {
  /**
   * Verify payment intent with Stripe and validate its status
   */
  static async verifyPaymentIntent(
    paymentIntentId: string,
    expectedUserId?: string,
    expectedAmount?: number
  ): Promise<PaymentVerificationResult> {
    try {
      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Check if payment intent exists
      if (!paymentIntent) {
        return {
          isValid: false,
          error: 'Payment intent not found',
        };
      }

      // Verify payment status
      if (paymentIntent.status !== 'succeeded') {
        return {
          isValid: false,
          paymentIntent,
          error: `Payment status is ${paymentIntent.status}, expected succeeded`,
          status: paymentIntent.status,
        };
      }

      // Verify user ownership if provided
      if (expectedUserId && paymentIntent.metadata?.userId !== expectedUserId) {
        return {
          isValid: false,
          paymentIntent,
          error: 'Payment intent does not belong to the specified user',
        };
      }

      // Verify amount if provided (convert from cents)
      const actualAmount = paymentIntent.amount / 100;
      if (expectedAmount && Math.abs(actualAmount - expectedAmount) > 0.01) {
        return {
          isValid: false,
          paymentIntent,
          error: `Amount mismatch: expected ${expectedAmount}, got ${actualAmount}`,
          amount: actualAmount,
        };
      }

      // Verify payment method type
      if (!paymentIntent.payment_method_types.includes('promptpay')) {
        return {
          isValid: false,
          paymentIntent,
          error: 'Payment method is not PromptPay',
        };
      }

      return {
        isValid: true,
        paymentIntent,
        amount: actualAmount,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error('Error verifying payment intent:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Check if payment intent has already been processed
   */
  static async isPaymentAlreadyProcessed(paymentIntentId: string): Promise<boolean> {
    try {
      // This would typically check your database for existing transactions
      // For now, we'll implement a basic check
      const { connectToDatabase } = await import('@/lib/db');
      const { Transaction } = await import('@/models/v3/Transaction');

      await connectToDatabase();

      const existingTransaction = await Transaction.findOne({
        'metadata.paymentIntentId': paymentIntentId,
        status: 'completed',
      });

      return !!existingTransaction;
    } catch (error) {
      console.error('Error checking if payment already processed:', error);
      return false;
    }
  }

  /**
   * Validate payment intent for deposit operation
   */
  static async validateDepositPayment(
    paymentIntentId: string,
    userId: string,
    expectedAmount: number
  ): Promise<PaymentVerificationResult> {
    // Check if already processed
    const alreadyProcessed = await this.isPaymentAlreadyProcessed(paymentIntentId);
    if (alreadyProcessed) {
      return {
        isValid: false,
        error: 'Payment has already been processed',
      };
    }

    // Verify with Stripe
    const verification = await this.verifyPaymentIntent(paymentIntentId, userId, expectedAmount);

    if (!verification.isValid) {
      return verification;
    }

    // Additional deposit-specific validations
    const { paymentIntent } = verification;

    // Check minimum deposit amount
    const amount = (paymentIntent?.amount || 0) / 100;
    if (amount < 10) {
      return {
        isValid: false,
        paymentIntent,
        error: 'Deposit amount is below minimum (10)',
        amount,
      };
    }

    // Check maximum deposit amount (optional safety check)
    if (amount > 100000) {
      return {
        isValid: false,
        paymentIntent,
        error: 'Deposit amount exceeds maximum (100,000)',
        amount,
      };
    }

    return verification;
  }

  /**
   * Get payment intent status without full verification
   */
  static async getPaymentStatus(paymentIntentId: string): Promise<{
    status?: string;
    error?: string;
  }> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return { status: paymentIntent.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Cancel payment intent if it's still cancelable
   */
  static async cancelPaymentIntent(paymentIntentId: string): Promise<{
    success: boolean;
    error?: string;
    status?: string;
  }> {
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
        cancellation_reason: 'requested_by_customer',
      });

      return {
        success: true,
        status: paymentIntent.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
