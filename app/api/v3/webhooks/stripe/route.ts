import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/db';
import Payment from '@/models/Payments';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Log the webhook event
    console.log(`Received webhook event: ${event.type}`);
    console.log(`Event ID: ${event.id}`);
    console.log(`Event created at: ${new Date(event.created * 1000).toISOString()}`);

    // Ensure database connection
    await connectToDatabase();

    // Handle the event
    switch (event.type) {
      // Handle payment intent events (for PromptPay)
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`);

        try {
          // Update the payment status in the database
          const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
          if (payment) {
            payment.status = paymentIntent.status;
            await payment.save();
            console.log(`Payment status updated for payment intent ${paymentIntent.id}`);

            // Update the buyer's balance
            try {
              // Extract the amount from the payment intent (in cents, convert to whole units)
              const amount = paymentIntent.amount / 100;

              // Extract the userId from the payment metadata if available
              const userId = paymentIntent.metadata?.userId;

              // Call the balance update API
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/v3/balance/update`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    // Note: We can't use auth token here since this is a server-side call
                    // The API will need to trust this call since it's coming from a webhook
                  },
                  body: JSON.stringify({
                    paymentIntentId: paymentIntent.id,
                    amount,
                    userId: userId || payment.userId, // Try to get userId from payment model if not in metadata
                  }),
                }
              );

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to update balance: ${errorData.error || 'Unknown error'}`);
              }

              console.log(`Balance updated successfully for payment intent ${paymentIntent.id}`);
            } catch (balanceError) {
              console.error(
                `Error updating balance for payment intent ${paymentIntent.id}:`,
                balanceError
              );
            }
          } else {
            console.log(`Payment not found for payment intent ${paymentIntent.id}`);
          }
        } catch (error) {
          console.error(`Error processing payment intent ${paymentIntent.id}:`, error);
        }
        break;
      }

      case 'payment_intent.processing': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} is processing`);

        // Update the payment status in the database
        const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
        if (payment) {
          payment.status = paymentIntent.status;
          await payment.save();
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(
          `PaymentIntent ${paymentIntent.id} failed: ${
            paymentIntent.last_payment_error?.message || 'Unknown error'
          }`
        );

        // Update the payment status in the database
        const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
        if (payment) {
          payment.status = paymentIntent.status;
          await payment.save();
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} was canceled`);

        // Update the payment status in the database
        const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
        if (payment) {
          payment.status = paymentIntent.status;
          await payment.save();
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
