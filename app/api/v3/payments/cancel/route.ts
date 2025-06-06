import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });
    }

    // Cancel the payment intent
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
      cancellation_reason: 'requested_by_customer',
    });

    return NextResponse.json({
      success: true,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('Error canceling payment intent:', error);
    return NextResponse.json({ error: 'Failed to cancel payment intent' }, { status: 500 });
  }
}
