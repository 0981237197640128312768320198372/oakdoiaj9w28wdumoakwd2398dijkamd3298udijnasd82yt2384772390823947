/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { Activity } from '@/models/v3/Activity';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Find pending deposits for the authenticated user
    const pendingDeposits = await Activity.findPendingDeposits(auth.userId as any);

    // Transform the data to include only necessary information
    const deposits = pendingDeposits.map((deposit) => ({
      id: deposit._id,
      paymentIntentId: deposit.metadata.paymentIntentId,
      amount: deposit.metadata.amount,
      qrCodeData: deposit.metadata.qrCodeData,
      expiresAt: deposit.metadata.expiresAt,
      createdAt: deposit.createdAt,
      status: deposit.status,
      canResume: deposit.metadata.canResume,
    }));

    return NextResponse.json({
      success: true,
      deposits,
      count: deposits.length,
    });
  } catch (error) {
    console.error('Error fetching pending deposits:', error);
    return NextResponse.json({ error: 'Failed to fetch pending deposits' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing paymentIntentId parameter' }, { status: 400 });
    }

    await connectToDatabase();

    // Update the deposit status to cancelled
    const updatedActivity = await Activity.updateDepositStatus(paymentIntentId, 'cancelled');

    if (!updatedActivity) {
      return NextResponse.json(
        { error: 'Deposit not found or already processed' },
        { status: 404 }
      );
    }

    // Verify the deposit belongs to the authenticated user
    if (updatedActivity.actors.primary.id.toString() !== auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: 'Deposit cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling deposit:', error);
    return NextResponse.json({ error: 'Failed to cancel deposit' }, { status: 500 });
  }
}
