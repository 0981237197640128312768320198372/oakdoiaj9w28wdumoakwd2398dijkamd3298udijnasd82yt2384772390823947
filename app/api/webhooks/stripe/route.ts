import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Validate signature and secret
  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  try {
    // Read the request body as an ArrayBuffer and convert to Buffer
    const bodyArrayBuffer = await request.arrayBuffer();
    const raw = Buffer.from(bodyArrayBuffer);

    // Construct the Stripe event
    const event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);

    // Handle the event (example logic)
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`Webhook error: ${(err as Error).message}`);
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
