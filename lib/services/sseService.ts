// Store active SSE connections
const activeConnections = new Map<string, ReadableStreamDefaultController>();

// Function to broadcast verification completion to waiting clients
export function broadcastVerificationComplete(
  pendingId: string,
  sellerData: { _id: string; store: { name: string }; username: string }
) {
  const controller = activeConnections.get(pendingId);
  if (controller) {
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
    } catch (error) {
      console.error('Error broadcasting verification complete:', error);
      activeConnections.delete(pendingId);
    }
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
