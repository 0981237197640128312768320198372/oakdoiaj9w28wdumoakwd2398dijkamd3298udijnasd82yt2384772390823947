import { NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

const createSSEMessage = (event: string, data: Record<string, unknown>) => {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get('paymentIntentId');

  if (!paymentIntentId) {
    return new Response('Missing paymentIntentId', { status: 400 });
  }

  const stream = new ReadableStream({
    start: async (controller) => {
      controller.enqueue(createSSEMessage('connection', { status: 'connected', paymentIntentId }));

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

      const intervalId = setInterval(async () => {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          controller.enqueue(createSSEMessage('payment_update', { status: paymentIntent.status }));

          if (['succeeded', 'failed', 'canceled'].includes(paymentIntent.status)) {
            clearInterval(intervalId);

            let isControllerClosed = false;

            request.signal.addEventListener('abort', () => {
              isControllerClosed = true;
            });

            setTimeout(() => {
              try {
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
        }
      }, 5000);

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

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
