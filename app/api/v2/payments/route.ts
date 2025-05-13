import { connectToDatabase } from '@/lib/db';
import Payment from '@/models/Payments';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, email } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'thb',
      payment_method_types: ['promptpay'],
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

    await connectToDatabase();
    const payment = new Payment({
      paymentIntentId: confirmedPaymentIntent.id,
      status: confirmedPaymentIntent.status,
      amount: amount * 100,
    });
    await payment.save();

    return NextResponse.json({
      qrCodeData,
      amount,
      paymentIntentId: confirmedPaymentIntent.id,
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
