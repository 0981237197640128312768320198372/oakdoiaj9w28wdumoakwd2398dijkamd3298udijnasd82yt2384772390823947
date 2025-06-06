import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { BalanceService } from '@/lib/services/balanceService';

// Type for client connection info
type ClientConnection = {
  controller: ReadableStreamDefaultController<Uint8Array>;
  pingInterval?: NodeJS.Timeout;
  lastActivity?: Date;
};

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Map to store active connections
const clients = new Map<string, ClientConnection>();

// Debug log for active connections
const logActiveConnections = () => {
  console.log(`Active SSE connections: ${clients.size}`);
  clients.forEach((_, key) => {
    console.log(`- Client connected for payment: ${key}`);
  });
};

// Function to send event to a specific client
const sendEventToClient = (
  paymentIntentId: string,
  event: string,
  data: Record<string, unknown>
) => {
  const connection = clients.get(paymentIntentId);
  if (connection?.controller) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    connection.controller.enqueue(new TextEncoder().encode(message));

    // Update last activity timestamp
    connection.lastActivity = new Date();

    console.log(`Event sent to client ${paymentIntentId}:`, { event, data });
    return true;
  } else {
    console.log(`No active connection found for payment ${paymentIntentId}`);
    return false;
  }
};

// Global function to send payment updates (can be called from other routes)
export const sendPaymentUpdate = (
  paymentIntentId: string,
  status: string,
  additionalData: Record<string, unknown> = {}
) => {
  const sent = sendEventToClient(paymentIntentId, 'payment_update', {
    status,
    ...additionalData,
    timestamp: new Date().toISOString(),
  });

  console.log(
    `Payment update ${sent ? 'sent' : 'failed to send'} for ${paymentIntentId}: ${status}`
  );
  return sent;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get('paymentIntentId');

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });
  }

  // Verify that the payment intent exists
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Set up Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // Create ping interval
        const pingInterval = setInterval(() => {
          const pingMessage = `event: ping\ndata: ${JSON.stringify({
            timestamp: new Date().toISOString(),
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(pingMessage));
        }, 30000);

        // Store controller and ping interval
        clients.set(paymentIntentId, {
          controller,
          pingInterval,
          lastActivity: new Date(),
        });

        console.log(`New SSE connection established for payment ${paymentIntentId}`);
        logActiveConnections();

        // Send initial status
        const message = `event: payment_update\ndata: ${JSON.stringify({
          status: paymentIntent.status,
          timestamp: new Date().toISOString(),
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(message));
        console.log(`Initial status sent for payment ${paymentIntentId}: ${paymentIntent.status}`);
      },
      cancel() {
        console.log(`SSE connection closed for payment ${paymentIntentId}`);
        // Clear the ping interval
        const connection = clients.get(paymentIntentId);
        if (connection?.pingInterval) {
          clearInterval(connection.pingInterval);
        }
        clients.delete(paymentIntentId);
        logActiveConnections();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return NextResponse.json({ error: 'Invalid payment intent ID' }, { status: 400 });
  }
}

// Webhook handler for payment updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') || '';
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Send update to client
        sendPaymentUpdate(paymentIntent.id, 'succeeded');

        // Update balance through BalanceService
        await BalanceService.completeDeposit(paymentIntent.id, 'completed');

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Send update to client
        sendPaymentUpdate(paymentIntent.id, 'failed', {
          error: paymentIntent.last_payment_error?.message,
        });

        // Update transaction status
        await BalanceService.completeDeposit(
          paymentIntent.id,
          'failed',
          paymentIntent.last_payment_error?.message || 'Payment failed'
        );

        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Send update to client
        sendPaymentUpdate(paymentIntent.id, 'canceled');

        // Update transaction status
        await BalanceService.completeDeposit(paymentIntent.id, 'cancelled', 'Payment canceled');

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling payment event:', error);
    return NextResponse.json({ error: 'Event handler failed' }, { status: 500 });
  }
}
