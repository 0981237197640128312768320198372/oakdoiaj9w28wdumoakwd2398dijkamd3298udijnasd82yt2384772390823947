// Store active SSE connections with cleanup functions
const activeConnections = new Map<
  string,
  {
    controller: ReadableStreamDefaultController;
    cleanup?: () => void;
  }
>();

// Function to broadcast verification completion to waiting clients with retry mechanism
export function broadcastVerificationComplete(
  pendingId: string,
  sellerData: { _id: string; store: { name: string }; username: string }
) {
  console.log(`SSE Service: Looking for connection with pendingId: ${pendingId}`);
  console.log(`SSE Service: Active connections count: ${activeConnections.size}`);
  console.log(`SSE Service: Active connection keys:`, Array.from(activeConnections.keys()));

  const attemptBroadcast = (attempt: number = 1) => {
    const connection = activeConnections.get(pendingId);
    if (connection) {
      console.log(`SSE Service: Found controller for pendingId: ${pendingId}, broadcasting...`);
      try {
        const data = JSON.stringify({
          status: 'verified',
          sellerId: sellerData._id,
          storeName: sellerData.store.name,
          username: sellerData.username,
          timestamp: new Date().toISOString(),
        });
        connection.controller.enqueue(`data: ${data}\n\n`);
        connection.controller.close();

        // Call cleanup function if available
        if (connection.cleanup) {
          connection.cleanup();
        }

        activeConnections.delete(pendingId);
        console.log(`SSE Service: Successfully broadcasted verification complete for ${pendingId}`);
      } catch (error) {
        console.error('Error broadcasting verification complete:', error);

        // Call cleanup function if available
        if (connection.cleanup) {
          connection.cleanup();
        }

        activeConnections.delete(pendingId);
      }
    } else {
      console.log(
        `SSE Service: No active connection found for pendingId: ${pendingId} (attempt ${attempt})`
      );

      // Retry up to 3 times with increasing delays
      if (attempt < 3) {
        const delay = attempt * 1000; // 1s, 2s delays
        console.log(`SSE Service: Retrying broadcast for ${pendingId} in ${delay}ms`);
        setTimeout(() => attemptBroadcast(attempt + 1), delay);
      } else {
        console.log(`SSE Service: Max retry attempts reached for ${pendingId}, giving up`);
      }
    }
  };

  // Start the broadcast attempt
  attemptBroadcast();
}

// Function to broadcast verification failure
export function broadcastVerificationFailed(pendingId: string, reason: string) {
  const connection = activeConnections.get(pendingId);
  if (connection) {
    try {
      const data = JSON.stringify({
        status: 'failed',
        reason,
        timestamp: new Date().toISOString(),
      });
      connection.controller.enqueue(`data: ${data}\n\n`);
      connection.controller.close();

      // Call cleanup function if available
      if (connection.cleanup) {
        connection.cleanup();
      }

      activeConnections.delete(pendingId);
    } catch (error) {
      console.error('Error broadcasting verification failed:', error);

      // Call cleanup function if available
      if (connection.cleanup) {
        connection.cleanup();
      }

      activeConnections.delete(pendingId);
    }
  }
}

// Function to register SSE connection
export function registerSSEConnection(
  pendingId: string,
  controller: ReadableStreamDefaultController,
  cleanup?: () => void
) {
  activeConnections.set(pendingId, { controller, cleanup });
}

// Function to unregister SSE connection
export function unregisterSSEConnection(pendingId: string) {
  const connection = activeConnections.get(pendingId);
  if (connection && connection.cleanup) {
    connection.cleanup();
  }
  activeConnections.delete(pendingId);
}

// Function to check if connection exists
export function hasActiveConnection(pendingId: string): boolean {
  return activeConnections.has(pendingId);
}
