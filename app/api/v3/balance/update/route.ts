import { NextResponse, NextRequest } from 'next/server';
import { BalanceService } from '@/lib/services/balanceService';
import { verifyAuth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { paymentIntentId, amount, transactionId, userId } = await request.json();

    if (!paymentIntentId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentIntentId, amount' },
        { status: 400 }
      );
    }

    let authenticatedUserId = userId;

    if (!authenticatedUserId) {
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

      authenticatedUserId = auth.userId;
    }

    if (transactionId) {
      const result = await BalanceService.completeDeposit(transactionId, 'completed');

      return NextResponse.json({
        success: true,
        message: 'Deposit completed successfully',
        balance: result.transaction.amount,
      });
    } else {
      const result = await BalanceService.addFunds(
        authenticatedUserId,
        'buyer',
        amount,
        'wallet',
        'deposit',
        {
          paymentIntentId,
          source: 'stripe',
          method: 'promptpay',
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Balance updated successfully',
        balance: result.balance.amount,
      });
    }
  } catch (error) {
    console.error('Error updating balance:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update balance' },
      { status: 500 }
    );
  }
}
