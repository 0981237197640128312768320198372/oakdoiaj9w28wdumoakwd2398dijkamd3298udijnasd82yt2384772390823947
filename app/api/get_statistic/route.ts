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

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const dateType = url.searchParams.get("type") || "daily"
    const date = url.searchParams.get("date")

    if (!date) {
      return NextResponse.json(
        { error: "Missing 'date' parameter" },
        { status: 400 }
      )
    }

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(fileName)

    const [exists] = await file.exists()
    if (!exists) {
      return NextResponse.json(
        { error: "Statistics data not found." },
        { status: 404 }
      )
    }

    const [contents] = await file.download()
    const data = JSON.parse(contents.toString())

    if (dateType === "monthly") {
      const monthlyData = data.monthly[date] || []
      return NextResponse.json({ data: monthlyData })
    } else if (dateType === "daily") {
      const dailyData = data.daily[date] || []
      return NextResponse.json({ data: dailyData })
    }

    return NextResponse.json(
      { error: "Invalid 'type' parameter" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics", details: error },
      { status: 500 }
    )
  }
}
