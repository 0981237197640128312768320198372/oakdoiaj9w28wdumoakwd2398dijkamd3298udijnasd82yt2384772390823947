// Store active SSE connections
const activeConnections = new Map<string, ReadableStreamDefaultController>();

// Function to broadcast verification completion to waiting clients
export function broadcastVerificationComplete(
  pendingId: string,
  sellerData: { _id: string; store: { name: string }; username: string }
) {
  console.log(`SSE Service: Looking for connection with pendingId: ${pendingId}`);
  console.log(`SSE Service: Active connections count: ${activeConnections.size}`);
  console.log(`SSE Service: Active connection keys:`, Array.from(activeConnections.keys()));

  const controller = activeConnections.get(pendingId);
  if (controller) {
    console.log(`SSE Service: Found controller for pendingId: ${pendingId}, broadcasting...`);
    try {
      const data = JSON.stringify({
        status: 'verified',
        sellerId: sellerData._id,
        storeName: sellerData.store.name,
        username: sellerData.username,
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(`data: ${data}\n\n`);
      controller.close();
      activeConnections.delete(pendingId);
      console.log(`SSE Service: Successfully broadcasted verification complete for ${pendingId}`);
    } catch (error) {
      console.error('Error broadcasting verification complete:', error);
      activeConnections.delete(pendingId);
    }
  } else {
    console.log(`SSE Service: No active connection found for pendingId: ${pendingId}`);
  }
}

// Function to broadcast verification failure
export function broadcastVerificationFailed(pendingId: string, reason: string) {
  const controller = activeConnections.get(pendingId);
  if (controller) {
    try {
      const data = JSON.stringify({
        status: 'failed',
        reason,
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(`data: ${data}\n\n`);
      controller.close();
      activeConnections.delete(pendingId);
    } catch (error) {
      console.error('Error broadcasting verification failed:', error);
      activeConnections.delete(pendingId);
    }
  }
}

// Function to register SSE connection
export function registerSSEConnection(
  pendingId: string,
  controller: ReadableStreamDefaultController
) {
  activeConnections.set(pendingId, controller);
}

// Function to unregister SSE connection
export function unregisterSSEConnection(pendingId: string) {
  activeConnections.delete(pendingId);
}

// Function to check if connection exists
export function hasActiveConnection(pendingId: string): boolean {
  return activeConnections.has(pendingId);
}
