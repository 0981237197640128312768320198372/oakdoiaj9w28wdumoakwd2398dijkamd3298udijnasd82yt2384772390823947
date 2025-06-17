/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { SellerStatsService } from '@/lib/services/sellerStatsService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const days = parseInt(searchParams.get('days') || '7');

    if (!username) {
      return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
    }

    if (days < 1 || days > 30) {
      return NextResponse.json(
        { error: 'Days parameter must be between 1 and 30' },
        { status: 400 }
      );
    }

    // Get sales trend data
    const salesTrend = await SellerStatsService.getRecentSalesTrend(username);

    // Process data to get the last N days
    const today = new Date();
    const targetDays = [];

    // Generate array of last N days in YYYY-MM-DD format
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      targetDays.push(date.toISOString().split('T')[0]);
    }

    // Create a map of existing data
    const salesMap = new Map();
    salesTrend.forEach((item: any) => {
      salesMap.set(item._id, {
        sales: item.dailySales || 0,
        revenue: item.dailyRevenue || 0,
        orders: item.dailyOrders || 0,
      });
    });

    // Fill in missing days with zero values
    const processedData = targetDays.map((date, index) => {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayOfWeek = new Date(date).getDay();

      return {
        date,
        day: days === 7 ? dayNames[dayOfWeek] : `Day ${index + 1}`,
        sales: salesMap.get(date)?.sales || 0,
        revenue: salesMap.get(date)?.revenue || 0,
        orders: salesMap.get(date)?.orders || 0,
      };
    });

    let trend = 0;
    if (salesTrend.length > 0) {
      const currentPeriodSales = processedData.reduce((sum, day) => sum + day.sales, 0);

      const previousPeriodStart = new Date(today);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - days * 2);
      const previousPeriodEnd = new Date(today);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - days);

      const previousPeriodSales = salesTrend
        .filter((item: any) => {
          const itemDate = new Date(item._id);
          return itemDate >= previousPeriodStart && itemDate < previousPeriodEnd;
        })
        .reduce((sum: number, item: any) => sum + (item.dailySales || 0), 0);

      if (previousPeriodSales > 0) {
        trend = ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100;
      } else if (currentPeriodSales > 0) {
        trend = 100; // If no previous sales but current sales exist, show 100% increase
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        salesData: processedData,
        totalSales: processedData.reduce((sum, day) => sum + day.sales, 0),
        totalRevenue: processedData.reduce((sum, day) => sum + day.revenue, 0),
        totalOrders: processedData.reduce((sum, day) => sum + day.orders, 0),
        trend: Math.round(trend * 100) / 100, // Round to 2 decimal places
        period: `Last ${days} days`,
      },
    });
  } catch (error) {
    console.error('Error fetching sales trend:', error);

    if (error instanceof Error && error.message === 'Seller not found') {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
