import { NextRequest } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

// Helper function to create SSE message
const createSSEMessage = (event: string, data: Record<string, unknown>) => {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get('paymentIntentId');

  if (!paymentIntentId) {
    return new Response('Missing paymentIntentId', { status: 400 });
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start: async (controller) => {
      // Send initial connection message
      controller.enqueue(createSSEMessage('connection', { status: 'connected', paymentIntentId }));

      // Check initial payment status
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        controller.enqueue(createSSEMessage('payment_update', { status: paymentIntent.status }));
      } catch (error) {
        console.error('Error checking initial payment status:', error);
        controller.enqueue(
          createSSEMessage('error', {
            message: 'Failed to check payment status',
          })
        );
      }

      // Set up interval to check payment status
      const intervalId = setInterval(async () => {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          controller.enqueue(createSSEMessage('payment_update', { status: paymentIntent.status }));

          // If payment is complete (succeeded, failed, or canceled), stop checking
          if (['succeeded', 'failed', 'canceled'].includes(paymentIntent.status)) {
            clearInterval(intervalId);

            // Set a flag to track if the controller has been closed
            let isControllerClosed = false;

            // Add an event listener to detect if the client disconnects
            request.signal.addEventListener('abort', () => {
              isControllerClosed = true;
            });

            // Keep the connection open for a bit longer to ensure the client receives the final status
            setTimeout(() => {
              try {
                // Only close if not already closed
                if (!isControllerClosed) {
                  controller.close();
                }
              } catch (error) {
                console.log('Controller already closed, ignoring');
              }
            }, 5000);
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          controller.enqueue(
            createSSEMessage('error', {
              message: 'Failed to check payment status',
            })
          );
          // Don't close the connection on error, keep trying
        }
      }, 5000); // Check every 5 seconds

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        try {
          controller.close();
        } catch (error) {
          console.log('Controller already closed, ignoring');
        }
      });
    },
  });

  // Return the stream as an SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
