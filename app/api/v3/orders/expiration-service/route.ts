import { NextRequest, NextResponse } from 'next/server';
import { orderExpirationService } from '@/lib/services/orderExpirationService';

export async function GET() {
  try {
    const status = await orderExpirationService.getServiceStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting service status:', error);
    return NextResponse.json({ error: 'Failed to get service status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'start':
        orderExpirationService.start();
        return NextResponse.json({ message: 'Service started successfully' });

      case 'stop':
        orderExpirationService.stop();
        return NextResponse.json({ message: 'Service stopped successfully' });

      case 'process':
        const result = await orderExpirationService.manualProcessExpiredOrders();
        return NextResponse.json({
          message: 'Manual processing completed',
          ...result,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing service:', error);
    return NextResponse.json({ error: 'Failed to manage service' }, { status: 500 });
  }
}
