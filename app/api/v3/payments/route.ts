/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from '@/lib/db';
import Payment from '@/models/Payments';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyAuth } from '@/lib/auth';
import { Activity } from '@/models/v3/Activity';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, email } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Validate minimum deposit amount
    if (amount < 10) {
      return NextResponse.json({ error: 'Minimum deposit amount is 10 THB' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'thb',
      payment_method_types: ['promptpay'],
      metadata: {
        userId: auth.userId,
        userType: 'buyer',
        amount: amount.toString(),
        dokmaiCoins: amount.toString(),
      },
    });

    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method_data: {
        type: 'promptpay',
        billing_details: {
          email,
        },
      },
    });

    const qrCodeData = confirmedPaymentIntent.next_action?.promptpay_display_qr_code?.data || '';

    if (!qrCodeData) {
      return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
    }

    await connectToDatabase();

    // Save payment record
    const payment = new Payment({
      paymentIntentId: confirmedPaymentIntent.id,
      status: confirmedPaymentIntent.status,
      amount: amount * 100,
      userId: auth.userId,
    });
    await payment.save();

    // Create activity record with QR persistence
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    try {
      await Activity.createDepositActivity({
        buyerId: auth.userId as any,
        amount: amount,
        paymentIntentId: confirmedPaymentIntent.id,
        qrCodeData: qrCodeData,
        expiresAt: expiresAt,
        status: 'pending',
      });
    } catch (activityError) {
      console.error('Error creating deposit activity:', activityError);
      // Don't fail the whole request if activity creation fails
    }

    return NextResponse.json({
      qrCodeData,
      amount,
      paymentIntentId: confirmedPaymentIntent.id,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get('paymentIntentId');
  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });
  }
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return NextResponse.json({ status: paymentIntent.status });
}
