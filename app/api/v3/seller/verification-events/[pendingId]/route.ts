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
        // Set up heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
          try {
            const heartbeatData = JSON.stringify({
              status: 'heartbeat',
              pendingId,
              timestamp: new Date().toISOString(),
            });
            controller.enqueue(`data: ${heartbeatData}\n\n`);
            console.log(`SSE Endpoint: Sent heartbeat for ${pendingId}`);
          } catch (error) {
            console.log(`SSE Endpoint: Heartbeat failed for ${pendingId}, cleaning up`);
            clearInterval(heartbeatInterval);
            unregisterSSEConnection(pendingId);
          }
        }, 30000); // Send heartbeat every 30 seconds

        // Auto-cleanup after 10 minutes
        const timeoutId = setTimeout(() => {
          console.log(`SSE Endpoint: Timeout reached for ${pendingId}`);
          clearInterval(heartbeatInterval);
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

        // Store cleanup function for this connection
        const cleanup = () => {
          clearInterval(heartbeatInterval);
          clearTimeout(timeoutId);
        };

        // Set up cleanup on connection close
        req.signal.addEventListener('abort', () => {
          console.log(`SSE Endpoint: Connection aborted for ${pendingId}`);
          cleanup();
          unregisterSSEConnection(pendingId);
          try {
            controller.close();
          } catch (error) {
            // Connection already closed
          }
        });

        // Register the connection with cleanup function
        console.log(`SSE Endpoint: Registering connection for pendingId: ${pendingId}`);
        registerSSEConnection(pendingId, controller, cleanup);

        // Send initial connection confirmation
        const initialData = JSON.stringify({
          status: 'connected',
          pendingId,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(`data: ${initialData}\n\n`);
        console.log(`SSE Endpoint: Sent initial connection confirmation for ${pendingId}`);
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
