import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/v3/Order';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // Validation
    if (!buyerId && !sellerId) {
      return NextResponse.json(
        { error: 'Either buyerId or sellerId is required' },
        { status: 400 }
      );
    }

    if (buyerId && !Types.ObjectId.isValid(buyerId)) {
      return NextResponse.json({ error: 'Invalid buyerId format' }, { status: 400 });
    }

    if (sellerId && !Types.ObjectId.isValid(sellerId)) {
      return NextResponse.json({ error: 'Invalid sellerId format' }, { status: 400 });
    }

    // Build query
    const query: Record<string, unknown> = {};

    if (buyerId) {
      query.buyerId = new Types.ObjectId(buyerId);
    }

    if (sellerId) {
      query.sellerId = new Types.ObjectId(sellerId);
    }

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .populate('buyerId', 'username email')
        .populate('sellerId', 'username store.name store.logoUrl')
        .populate('items.productId', 'title images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    // Format response
    const formattedOrders = orders.map((order) => ({
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
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    return NextResponse.json({ error: 'Failed to fetch order history' }, { status: 500 });
  }
}
