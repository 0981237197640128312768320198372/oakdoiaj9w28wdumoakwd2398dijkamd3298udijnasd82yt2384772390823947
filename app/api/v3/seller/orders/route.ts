import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/v3/Order';
import { Buyer } from '@/models/v3/Buyer';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Validation
    if (!sellerId) {
      return NextResponse.json({ error: 'Missing required parameter: sellerId' }, { status: 400 });
    }

    if (!Types.ObjectId.isValid(sellerId)) {
      return NextResponse.json({ error: 'Invalid sellerId format' }, { status: 400 });
    }

    // Build query
    const query: { sellerId: Types.ObjectId; status?: string | { $in: string[] } } = {
      sellerId: new Types.ObjectId(sellerId),
    };

    if (status && status !== 'all') {
      // Support new status values
      if (status === 'active') {
        query.status = { $in: ['pending', 'confirmed'] };
      } else {
        query.status = status;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch orders with buyer information
    const orders = await Order.find(query)
      .populate({
        path: 'buyerId',
        model: Buyer,
        select: 'username email firstName lastName',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    // Format orders for response
    const formattedOrders = orders.map((order) => {
      const buyer = order.buyerId as unknown as {
        _id: string;
        username?: string;
        email: string;
        firstName?: string;
        lastName?: string;
      };
      return {
        _id: order._id,
        orderId: order.orderId,
        buyer: {
          _id: buyer._id,
          name:
            buyer.username ||
            `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() ||
            'Unknown',
          email: buyer.email,
        },
        items: order.items.map((item) => ({
          productId: item.productId,
          productTitle: item.productTitle,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          digitalAssets: item.digitalAssets,
        })),
        totals: order.totals,
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        completedAt: order.completedAt,
        expiresAt: order.expiresAt,
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
