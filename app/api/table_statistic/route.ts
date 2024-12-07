/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"

interface StatisticEntry {
  depositAmount: number
  spentAmount: number
  productsSold: number
  userLogins?: number // Optional for monthly statistics
}

export async function GET() {
  try {
    // Format today’s date
    const today = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Bangkok",
    }).format(new Date())

    // console.log("Today:", today)

    // Fetch daily statistics for today
    const dailyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/get_statistic?type=daily&date=${today}`,
      { cache: "no-store" }
    )
    const dailyData: StatisticEntry[] = dailyResponse.ok
      ? (await dailyResponse.json()).data
      : []

    const monthlyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/get_statistic?type=monthly&fetchAll=true`,
      { cache: "no-store" }
    )
    const allMonthlyData: Record<string, StatisticEntry[]> = monthlyResponse.ok
      ? (await monthlyResponse.json()).data
      : {}

    const stockResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/get_total_stock_available`,
      { cache: "no-store" }
    )
    const stockData = stockResponse.ok
      ? await stockResponse.json()
      : { totalStock: 0 }

    // Calculate all-time totals
    const allTimeData = Object.values(allMonthlyData)
      .flat()
      .reduce(
        (totals: StatisticEntry, entry: StatisticEntry) => {
          // console.log("Processing Monthly Entry:", entry)
          totals.depositAmount += entry.depositAmount || 0
          totals.spentAmount += entry.spentAmount || 0
          totals.productsSold += entry.productsSold || 0
          return totals
        },
        { depositAmount: 0, spentAmount: 0, productsSold: 0 }
      )
    // console.log("All-Time Totals:", allTimeData)

    // Calculate today’s totals
    const todayData = dailyData.reduce(
      (totals: StatisticEntry, entry: StatisticEntry) => {
        // console.log("Processing Daily Entry:", entry)
        totals.depositAmount += entry.depositAmount || 0
        totals.spentAmount += entry.spentAmount || 0
        totals.productsSold += entry.productsSold || 0
        totals.userLogins = (totals.userLogins || 0) + (entry.userLogins || 0)
        return totals
      },
      { depositAmount: 0, spentAmount: 0, productsSold: 0, userLogins: 0 }
    )

    // Prepare the response
    const response = {
      totalProductsSoldAllTime: allTimeData.productsSold,
      totalDepositAllTime: allTimeData.depositAmount,
      totalSpentAllTime: allTimeData.spentAmount,
      totalProductsSoldToday: todayData.productsSold,
      totalDepositToday: todayData.depositAmount,
      totalSpentToday: todayData.spentAmount,
      stockAvailable: stockData.totalStock,
      usersLoginToday: todayData.userLogins,
    }

    // console.log("Final Response:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch table statistics" },
      { status: 500 }
    )
  }
}
