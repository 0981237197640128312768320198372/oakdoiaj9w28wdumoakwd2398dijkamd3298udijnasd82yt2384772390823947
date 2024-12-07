/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD format
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

    // Fetch daily statistics
    const dailyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/get_statistic?type=daily&date=${today}`
    )
    const dailyData = dailyResponse.ok ? (await dailyResponse.json()).data : []

    // Fetch monthly statistics
    const monthlyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/get_statistic?type=monthly&date=${currentMonth}`
    )
    const monthlyData = monthlyResponse.ok
      ? (await monthlyResponse.json()).data
      : []

    // Fetch stock availability
    const stockResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/get_total_stock_available`
    )
    const stockData = stockResponse.ok ? await stockResponse.json() : 0

    // Calculate all-time statistics
    const allTimeData = monthlyData.reduce(
      (totals: any, entry: any) => {
        totals.depositAmount += entry.depositAmount || 0
        totals.spentAmount += entry.spentAmount || 0
        totals.productsSold += entry.productsSold || 0
        return totals
      },
      { depositAmount: 0, spentAmount: 0, productsSold: 0 }
    )

    // Calculate today’s statistics
    const todayData = dailyData.reduce(
      (totals: any, entry: any) => {
        totals.depositAmount += entry.depositAmount || 0
        totals.spentAmount += entry.spentAmount || 0
        totals.productsSold += entry.productsSold || 0
        totals.userLogins += entry.userLogins || 0
        return totals
      },
      { depositAmount: 0, spentAmount: 0, productsSold: 0, userLogins: 0 }
    )

    // Combine all data into a single response
    const response = {
      totalProductsSoldAllTime: allTimeData.productsSold,
      totalDepositAllTime: allTimeData.depositAmount,
      totalSpentAllTime: allTimeData.spentAmount,
      totalProductsSoldToday: todayData.productsSold,
      totalDepositToday: todayData.depositAmount,
      totalSpentToday: todayData.spentAmount,
      stockAvailable: stockData,
      usersLoginToday: todayData.userLogins,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch table statistics" },
      { status: 500 }
    )
  }
}
