import { NextResponse, NextRequest } from 'next/server';
import { BalanceService } from '@/lib/services/balanceService';
import { verifyAuth } from '@/lib/auth';
import { headers } from 'next/headers';
import { IdempotencyService } from '@/lib/services/idempotencyService';
import { PaymentVerificationService } from '@/lib/services/paymentVerificationService';
import { Activity } from '@/models/v3/Activity';

export async function POST(request: Request) {
  try {
    const { paymentIntentId, amount, transactionId, userId } = await request.json();

    // Validate required fields
    if (!paymentIntentId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentIntentId, amount' },
        { status: 400 }
      );
    }

    // Authenticate user
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    const mockRequest = {
      headers: {
        get: (name: string) => (name === 'authorization' ? authHeader : null),
      },
    } as unknown as NextRequest;

    const auth = await verifyAuth(mockRequest);

    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authenticatedUserId = auth.userId;

    // Validate that userId matches authenticated user if provided
    if (userId && userId !== authenticatedUserId) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // Handle legacy transactionId flow (if still needed)
    if (transactionId) {
      const idempotencyKey = IdempotencyService.generateKey(
        transactionId,
        authenticatedUserId,
        'complete_deposit'
      );

      const result = await IdempotencyService.executeWithIdempotency(idempotencyKey, async () => {
        return await BalanceService.completeDeposit(transactionId, 'completed');
      });

      return NextResponse.json({
        success: true,
        message: 'Deposit completed successfully',
        balance: result.transaction.amount,
      });
    }

    // Main payment intent flow with security enhancements
    const idempotencyKey = IdempotencyService.generateKey(
      paymentIntentId,
      authenticatedUserId,
      'deposit_balance_update'
    );

    const result = await IdempotencyService.executeWithIdempotency(idempotencyKey, async () => {
      // Step 1: Verify payment intent with Stripe
      const verification = await PaymentVerificationService.validateDepositPayment(
        paymentIntentId,
        authenticatedUserId,
        amount
      );

      if (!verification.isValid) {
        throw new Error(`Payment verification failed: ${verification.error}`);
      }

      // Step 2: Ensure amounts match exactly
      const verifiedAmount = verification.amount!;
      if (Math.abs(verifiedAmount - amount) > 0.01) {
        throw new Error(`Amount mismatch: requested ${amount}, verified ${verifiedAmount}`);
      }

      // Step 3: Add funds to user balance
      const balanceResult = await BalanceService.addFunds(
        authenticatedUserId,
        'buyer',
        verifiedAmount,
        'wallet',
        'deposit',
        {
          paymentIntentId,
          source: 'stripe',
          method: 'promptpay',
          verifiedAt: new Date().toISOString(),
          stripeStatus: verification.status,
        }
      );

      // Step 4: Update activity status to completed
      try {
        await Activity.updateDepositStatus(paymentIntentId, 'completed');
      } catch (activityError) {
        console.error('Error updating activity status:', activityError);
        // Don't fail the whole process if activity update fails
      }

      return {
        balance: balanceResult.balance.amount,
        transaction: balanceResult.transaction,
        verifiedAmount,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Balance updated successfully',
      balance: result.balance,
      transactionId: result.transaction?.transactionId,
    });
  } catch (error) {
    console.error('Error updating balance:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Payment verification failed')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error.message.includes('Operation already in progress')) {
        return NextResponse.json({ error: 'Deposit is already being processed' }, { status: 409 });
      }

      if (error.message.includes('Amount mismatch')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update balance' },
      { status: 500 }
    );
  }
}
