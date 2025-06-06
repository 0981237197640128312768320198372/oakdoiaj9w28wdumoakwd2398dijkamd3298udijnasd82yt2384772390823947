import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { BalanceService } from '@/lib/services/balanceService';
import { sendPaymentUpdate } from '../payment-events/route';
import { connectToDatabase } from '@/lib/db';
import Payment from '@/models/Payments';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-09-30.acacia',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Helper function to log webhook events
const logWebhookEvent = (event: Stripe.Event) => {
  console.log(`Received webhook event: ${event.type}`);
  console.log(`Event ID: ${event.id}`);
  console.log(`Event created at: ${new Date(event.created * 1000).toISOString()}`);
};

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
    logWebhookEvent(event);

    // Handle the event
    switch (event.type) {
      // Handle payment intent events (for PromptPay)
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`);

        try {
          // Get metadata from the payment intent
          const { userId, amount } = paymentIntent.metadata || {};

          console.log(`Processing payment intent with metadata:`, paymentIntent.metadata);

          if (userId && amount) {
            console.log(`Attempting to complete deposit for user ${userId}, amount: ${amount}`);

            // Find the payment in our database
            await connectToDatabase();
            const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });

            if (payment) {
              console.log(`Found payment record: ${payment._id}`);

              // Update payment status
              payment.status = 'completed';
              await payment.save();

              // Complete the deposit transaction
              const result = await BalanceService.completeDeposit(paymentIntent.id, 'completed');
              console.log(`Deposit completion result:`, result);

              // Send update to any connected clients
              sendPaymentUpdate(paymentIntent.id, 'succeeded', {
                amount,
                timestamp: new Date().toISOString(),
              });

              console.log(`Deposit completed for user ${userId}, amount: ${amount}`);
            } else {
              console.error(`No payment record found for payment intent ${paymentIntent.id}`);
            }
          } else {
            console.warn(`Missing metadata in payment intent ${paymentIntent.id}`);
          }
        } catch (error) {
          console.error(`Error processing payment intent ${paymentIntent.id}:`, error);
        }
        break;
      }

      case 'payment_intent.processing': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} is processing`);

        // Send update to any connected clients
        sendPaymentUpdate(paymentIntent.id, 'processing', {
          timestamp: new Date().toISOString(),
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(
          `PaymentIntent ${paymentIntent.id} failed: ${
            paymentIntent.last_payment_error?.message || 'Unknown error'
          }`
        );

        // Mark the deposit as failed
        await BalanceService.completeDeposit(
          paymentIntent.id,
          'failed',
          paymentIntent.last_payment_error?.message || 'Payment failed'
        );

        // Send update to any connected clients
        sendPaymentUpdate(paymentIntent.id, 'failed', {
          error: paymentIntent.last_payment_error?.message || 'Payment failed',
          timestamp: new Date().toISOString(),
        });
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} was canceled`);

        // Mark the deposit as cancelled
        await BalanceService.completeDeposit(paymentIntent.id, 'cancelled', 'Payment canceled');

        // Send update to any connected clients
        sendPaymentUpdate(paymentIntent.id, 'canceled', {
          timestamp: new Date().toISOString(),
        });
        break;
      }

      // Handle checkout session events (for card payments)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session ${session.id} completed`);

        // Verify that payment was successful
        if (session.payment_status === 'paid') {
          // Get the metadata from the session
          const { userId, amount } = session.metadata || {};

          if (!userId || !amount) {
            console.error('Missing metadata in Stripe session:', session.id);
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
          }

          // Complete the deposit transaction
          await BalanceService.completeDeposit(
            session.id, // Using session ID as the transaction reference
            'completed'
          );

          // Send update to any connected clients
          if (session.payment_intent) {
            sendPaymentUpdate(session.payment_intent as string, 'succeeded', {
              sessionId: session.id,
              amount,
              timestamp: new Date().toISOString(),
            });
          }

          console.log(`Deposit completed for user ${userId}, amount: ${amount}`);
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session ${session.id} expired`);

        // Cancel the deposit transaction
        await BalanceService.completeDeposit(session.id, 'cancelled', 'Checkout session expired');

        // Send update to any connected clients
        if (session.payment_intent) {
          sendPaymentUpdate(session.payment_intent as string, 'canceled', {
            sessionId: session.id,
            reason: 'Checkout session expired',
            timestamp: new Date().toISOString(),
          });
        }

        console.log(`Deposit cancelled for session ${session.id} (expired)`);
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
