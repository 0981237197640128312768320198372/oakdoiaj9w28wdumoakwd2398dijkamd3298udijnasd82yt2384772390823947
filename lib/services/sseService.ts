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

        // Send the verification complete message
        connection.controller.enqueue(`data: ${data}\n\n`);

        // Close the connection after a short delay to ensure message is sent
        setTimeout(() => {
          try {
            connection.controller.close();
          } catch (error) {
            console.log(`SSE Service: Connection already closed for ${pendingId}`);
          }
        }, 100);

        // Call cleanup function if available
        if (connection.cleanup) {
          connection.cleanup();
        }

        activeConnections.delete(pendingId);
        console.log(`SSE Service: Successfully broadcasted verification complete for ${pendingId}`);
        return true; // Success
      } catch (error) {
        console.error(
          `SSE Service: Error broadcasting verification complete for ${pendingId}:`,
          error
        );

        // Call cleanup function if available
        if (connection.cleanup) {
          connection.cleanup();
        }

        activeConnections.delete(pendingId);
        return false; // Failed
      }
    } else {
      console.log(
        `SSE Service: No active connection found for pendingId: ${pendingId} (attempt ${attempt})`
      );

      // Retry up to 5 times with shorter delays for better responsiveness
      if (attempt < 5) {
        const delay = Math.min(attempt * 500, 2000); // 500ms, 1s, 1.5s, 2s, 2s
        console.log(`SSE Service: Retrying broadcast for ${pendingId} in ${delay}ms`);
        setTimeout(() => attemptBroadcast(attempt + 1), delay);
      } else {
        console.log(`SSE Service: Max retry attempts reached for ${pendingId}, giving up`);
        return false; // Failed after all retries
      }
    }
  };

  // Start the broadcast attempt immediately
  return attemptBroadcast();
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
