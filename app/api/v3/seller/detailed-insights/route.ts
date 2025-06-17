import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/v3/Order';
import { Seller } from '@/models/v3/Seller';

interface DetailedInsightsData {
  customerAnalytics: {
    newCustomers: number;
    returningCustomers: number;
    avgOrderValue: number;
    totalUniqueCustomers: number;
  };
  financialSummary: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
    totalRevenue: number;
  };
  growthTrends: {
    ordersGrowth: number;
    revenueGrowth: number;
    customerGrowth: number;
  };
  lastUpdated: Date;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find seller
    const seller = await Seller.findOne({ username });
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const sellerId = seller._id;

    // Get current date ranges
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Run all queries in parallel for better performance
    const [currentMonthStats, lastMonthStats, customerAnalytics, totalStats] = await Promise.all([
      // Current month statistics
      Order.aggregate([
        {
          $match: {
            sellerId: sellerId,
            status: 'completed',
            completedAt: { $gte: currentMonthStart },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totals.total' },
            orders: { $sum: 1 },
            totalQuantity: { $sum: '$metadata.totalQuantity' },
          },
        },
      ]),

      // Last month statistics
      Order.aggregate([
        {
          $match: {
            sellerId: sellerId,
            status: 'completed',
            completedAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totals.total' },
            orders: { $sum: 1 },
            totalQuantity: { $sum: '$metadata.totalQuantity' },
          },
        },
      ]),

      // Customer analytics
      Order.aggregate([
        {
          $match: {
            sellerId: sellerId,
            status: 'completed',
          },
        },
        {
          $group: {
            _id: '$buyerEmail',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$totals.total' },
            firstOrder: { $min: '$completedAt' },
            lastOrder: { $max: '$completedAt' },
          },
        },
        {
          $group: {
            _id: null,
            totalUniqueCustomers: { $sum: 1 },
            newCustomers: {
              $sum: {
                $cond: [{ $gte: ['$firstOrder', lastMonthStart] }, 1, 0],
              },
            },
            returningCustomers: {
              $sum: {
                $cond: [{ $gt: ['$orderCount', 1] }, 1, 0],
              },
            },
            avgOrderValue: { $avg: { $divide: ['$totalSpent', '$orderCount'] } },
          },
        },
      ]),

      // Total statistics
      Order.aggregate([
        {
          $match: {
            sellerId: sellerId,
            status: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totals.total' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Process results
    const currentMonth = currentMonthStats[0] || { revenue: 0, orders: 0, totalQuantity: 0 };
    const lastMonth = lastMonthStats[0] || { revenue: 0, orders: 0, totalQuantity: 0 };
    const customers = customerAnalytics[0] || {
      totalUniqueCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      avgOrderValue: 0,
    };
    const totals = totalStats[0] || { totalRevenue: 0, totalOrders: 0 };

    // Calculate growth percentages
    const revenueGrowth =
      lastMonth.revenue > 0
        ? ((currentMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100
        : 0;

    const ordersGrowth =
      lastMonth.orders > 0
        ? ((currentMonth.orders - lastMonth.orders) / lastMonth.orders) * 100
        : 0;

    // Estimate customer growth (simplified calculation)
    const customerGrowth =
      customers.totalUniqueCustomers > 0
        ? (customers.newCustomers / customers.totalUniqueCustomers) * 100
        : 0;

    const insights: DetailedInsightsData = {
      customerAnalytics: {
        newCustomers: customers.newCustomers,
        returningCustomers: customers.returningCustomers,
        avgOrderValue: customers.avgOrderValue || 0,
        totalUniqueCustomers: customers.totalUniqueCustomers,
      },
      financialSummary: {
        thisMonth: currentMonth.revenue,
        lastMonth: lastMonth.revenue,
        growth: revenueGrowth,
        totalRevenue: totals.totalRevenue,
      },
      growthTrends: {
        ordersGrowth,
        revenueGrowth,
        customerGrowth,
      },
      lastUpdated: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('Error fetching detailed insights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
