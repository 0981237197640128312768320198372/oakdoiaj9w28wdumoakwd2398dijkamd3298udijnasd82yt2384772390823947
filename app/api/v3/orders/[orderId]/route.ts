import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/v3/Order';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectToDatabase();

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Find order by orderId (not MongoDB _id)
    const order = await Order.findOne({ orderId })
      .populate('buyerId', 'username email')
      .populate('sellerId', 'username store.name store.logoUrl')
      .populate('items.productId', 'title images');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Format response
    const response = {
      orderId: order.orderId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      buyer: {
        id: (order.buyerId as unknown as { _id: string; username: string; email: string })._id,
        username: (order.buyerId as unknown as { _id: string; username: string; email: string })
          .username,
        email: (order.buyerId as unknown as { _id: string; username: string; email: string }).email,
      },
      seller: {
        id: (
          order.sellerId as unknown as {
            _id: string;
            username: string;
            store?: { name: string; logoUrl?: string };
          }
        )._id,
        username: (
          order.sellerId as unknown as {
            _id: string;
            username: string;
            store?: { name: string; logoUrl?: string };
          }
        ).username,
        storeName: (
          order.sellerId as unknown as {
            _id: string;
            username: string;
            store?: { name: string; logoUrl?: string };
          }
        ).store?.name,
        logoUrl: (
          order.sellerId as unknown as {
            _id: string;
            username: string;
            store?: { name: string; logoUrl?: string };
          }
        ).store?.logoUrl,
      },
      items: order.items.map((item) => ({
        productId: (item.productId as unknown as { _id: string; title: string; images?: string[] })
          ._id,
        productTitle: item.productTitle,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        digitalAssets: item.digitalAssets,
        productImages:
          (item.productId as unknown as { _id: string; title: string; images?: string[] }).images ||
          [],
      })),
      totals: order.totals,
      timestamps: {
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        expiresAt: order.expiresAt,
        completedAt: order.completedAt,
        cancelledAt: order.cancelledAt,
      },
      metadata: order.metadata,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
