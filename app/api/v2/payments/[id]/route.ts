import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(params.id);
    return NextResponse.json({ status: paymentIntent.status });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json({ error: 'Failed to fetch payment status' }, { status: 500 });
  }
}
