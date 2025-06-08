import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { PendingRegistration } from '@/models/v3/PendingRegistration';
import { Seller } from '@/models/v3/Seller';
import { registerSSEConnection, unregisterSSEConnection } from '@/lib/services/sseService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pendingId: string }> }
) {
  const { pendingId } = await params;

  try {
    await connectToDatabase();

    // Verify that the pending registration exists
    const pendingRegistration = await PendingRegistration.findById(pendingId);
    if (!pendingRegistration) {
      return NextResponse.json({ error: 'Invalid pending registration' }, { status: 404 });
    }

    // Check if already verified
    const existingSeller = await Seller.findOne({
      'verification.code': pendingRegistration.verification.code,
      'verification.status': 'verified',
    });

    if (existingSeller) {
      // Already verified, send immediate response
      const stream = new ReadableStream({
        start(controller) {
          const data = JSON.stringify({
            status: 'verified',
            sellerId: existingSeller._id,
            storeName: existingSeller.store.name,
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(`data: ${data}\n\n`);
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control',
        },
      });
    }

    // Create SSE stream for pending verification
    const stream = new ReadableStream({
      start(controller) {
        // Store the controller for this pending ID
        registerSSEConnection(pendingId, controller);

        // Send initial connection confirmation
        const initialData = JSON.stringify({
          status: 'connected',
          pendingId,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(`data: ${initialData}\n\n`);

        // Set up cleanup on connection close
        req.signal.addEventListener('abort', () => {
          unregisterSSEConnection(pendingId);
          try {
            controller.close();
          } catch (error) {
            // Connection already closed
          }
        });

        // Auto-cleanup after 10 minutes
        setTimeout(() => {
          unregisterSSEConnection(pendingId);
          try {
            const timeoutData = JSON.stringify({
              status: 'timeout',
              message: 'Verification timeout. Please try again.',
              timestamp: new Date().toISOString(),
            });
            controller.enqueue(`data: ${timeoutData}\n\n`);
            controller.close();
          } catch (error) {
            // Connection already closed
          }
        }, 10 * 60 * 1000); // 10 minutes
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('Error in verification SSE endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
