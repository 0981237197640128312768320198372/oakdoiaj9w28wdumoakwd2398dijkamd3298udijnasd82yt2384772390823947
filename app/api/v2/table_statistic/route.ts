/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

interface StatisticEntry {
  depositAmount: number;
  spentAmount: number;
  productsSold: number;
  userLogins?: number;
}

export async function GET() {
  try {
    const today = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Bangkok',
    }).format(new Date());

    const dailyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v2/get_statistic?type=daily&date=${today}`,
      { cache: 'no-store' }
    );
    const dailyData: StatisticEntry[] = dailyResponse.ok ? (await dailyResponse.json()).data : [];

    const monthlyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v2/get_statistic?type=monthly&fetchAll=true`,
      { cache: 'no-store' }
    );
    const allMonthlyData: Record<string, StatisticEntry[]> = monthlyResponse.ok
      ? (await monthlyResponse.json()).data
      : {};

    const stockResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/get_total_stock_available`,
      { cache: 'no-store' }
    );
    const stockData = stockResponse.ok ? await stockResponse.json() : { totalStock: 0 };

    const allTimeData = Object.values(allMonthlyData)
      .flat()
      .reduce(
        (totals: StatisticEntry, entry: StatisticEntry) => {
          totals.depositAmount += entry.depositAmount || 0;
          totals.spentAmount += entry.spentAmount || 0;
          totals.productsSold += entry.productsSold || 0;
          return totals;
        },
        { depositAmount: 0, spentAmount: 0, productsSold: 0 }
      );
    const todayData = dailyData.reduce(
      (totals: StatisticEntry, entry: StatisticEntry) => {
        totals.depositAmount += entry.depositAmount || 0;
        totals.spentAmount += entry.spentAmount || 0;
        totals.productsSold += entry.productsSold || 0;
        totals.userLogins = (totals.userLogins || 0) + (entry.userLogins || 0);
        return totals;
      },
      { depositAmount: 0, spentAmount: 0, productsSold: 0, userLogins: 0 }
    );

    const response = {
      totalProductsSoldAllTime: allTimeData.productsSold,
      totalDepositAllTime: allTimeData.depositAmount,
      totalSpentAllTime: allTimeData.spentAmount,
      totalProductsSoldToday: todayData.productsSold,
      totalDepositToday: todayData.depositAmount,
      totalSpentToday: todayData.spentAmount,
      stockAvailable: stockData.totalStock,
      usersLoginToday: todayData.userLogins,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch table statistics' }, { status: 500 });
  }
}
