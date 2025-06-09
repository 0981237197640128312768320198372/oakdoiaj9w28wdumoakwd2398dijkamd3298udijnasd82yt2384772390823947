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

        // Send initial connection confirmation and check if already verified
        const initialData = JSON.stringify({
          status: 'connected',
          pendingId,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(`data: ${initialData}\n\n`);
        console.log(`SSE Endpoint: Sent initial connection confirmation for ${pendingId}`);

        // Immediately check if verification was already completed
        setTimeout(async () => {
          try {
            const recentSeller = await Seller.findOne({
              'verification.code': { $exists: true },
            })
              .select('verification store username')
              .sort({ 'verification.verifiedAt': -1 });

            if (recentSeller) {
              const pendingReg = await PendingRegistration.findById(pendingId);
              if (
                pendingReg &&
                recentSeller.verification.code === pendingReg.verification.code &&
                recentSeller.verification.status === 'verified'
              ) {
                console.log(
                  `SSE Endpoint: Found already verified seller for ${pendingId}, sending immediate verification`
                );
                const verifiedData = JSON.stringify({
                  status: 'verified',
                  sellerId: recentSeller._id,
                  storeName: recentSeller.store.name,
                  username: recentSeller.username,
                  timestamp: new Date().toISOString(),
                });
                controller.enqueue(`data: ${verifiedData}\n\n`);
                controller.close();
                cleanup();
                unregisterSSEConnection(pendingId);
              }
            }
          } catch (error) {
            console.error(
              `SSE Endpoint: Error checking immediate verification status for ${pendingId}:`,
              error
            );
          }
        }, 1000); // Check after 1 second to allow connection to stabilize
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
