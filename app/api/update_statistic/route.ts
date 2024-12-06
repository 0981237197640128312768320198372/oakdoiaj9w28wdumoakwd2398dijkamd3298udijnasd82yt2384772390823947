/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"

// Set up Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
})

const bucketName = process.env.GCP_BUCKET_NAME || ""
const fileName = "statistics.json"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      time,
      date,
      depositAmount = 0,
      spentAmount = 0,
      productsSold = 0,
      userLogins = 0,
    } = body

    if (!time || !date) {
      return NextResponse.json(
        { error: "Missing 'time' or 'date' parameter" },
        { status: 400 }
      )
    }

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(fileName)

    // Fetch existing data or initialize if not exists
    const [exists] = await file.exists()
    let data = exists
      ? JSON.parse((await file.download())[0].toString())
      : { daily: {}, monthly: {} }

    // Initialize daily and monthly if not present
    if (!data.daily[date]) {
      data.daily[date] = []
    }

    // Append new entry to daily data
    data.daily[date].push({
      time,
      depositAmount,
      spentAmount,
      productsSold,
      userLogins,
    })

    // Summarize daily totals
    const dailyTotals = data.daily[date].reduce(
      (
        totals: {
          depositAmount: any
          spentAmount: any
          productsSold: any
          userLogins: any
        },
        entry: {
          depositAmount: any
          spentAmount: any
          productsSold: any
          userLogins: any
        }
      ) => {
        totals.depositAmount += entry.depositAmount || 0
        totals.spentAmount += entry.spentAmount || 0
        totals.productsSold += entry.productsSold || 0
        totals.userLogins += entry.userLogins || 0
        return totals
      },
      { depositAmount: 0, spentAmount: 0, productsSold: 0, userLogins: 0 }
    )

    // Update monthly data
    const month = date.slice(0, 7) // e.g., "2024-12"
    if (!data.monthly[month]) {
      data.monthly[month] = []
    }

    const dayIndex = data.monthly[month].findIndex(
      (entry: { date: any }) => entry.date === date
    )
    if (dayIndex !== -1) {
      // Update existing daily summary in monthly
      data.monthly[month][dayIndex] = { date, ...dailyTotals }
    } else {
      // Add new daily summary to monthly
      data.monthly[month].push({ date, ...dailyTotals })
    }

    // Save updated data
    await file.save(JSON.stringify(data, null, 2), {
      contentType: "application/json",
    })

    return NextResponse.json({ message: "Statistics updated successfully" })
  } catch (error) {
    console.error("Error updating statistics:", error)
    return NextResponse.json(
      { error: "Failed to update statistics", details: error },
      { status: 500 }
    )
  }
}
