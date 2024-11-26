import { NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
})

const bucketName = process.env.GCP_BUCKET_NAME || "" // Replace with your bucket name
const logFileName = "activity_logs.json" // Name of the log file in GCS

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key")

  if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_LOGGING_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { logEntry } = await request.json()

  if (!logEntry) {
    return NextResponse.json(
      { error: "Log entry is required" },
      { status: 400 }
    )
  }

  try {
    // Step 1: Get the existing log file from the bucket
    const bucket = storage.bucket(bucketName)
    const file = bucket.file(logFileName)

    let currentLogs: any[] = []

    try {
      const [contents] = await file.download() // Download existing logs
      currentLogs = JSON.parse(contents.toString())
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as any).code === 404
      ) {
        console.log("Log file not found, creating a new one.")
      } else {
        console.error("Error reading log file:", error)
        throw error
      }
    }
    const currentDate = new Date()
    const timeStampOptions: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Bangkok",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
    const timeStampFormatter = new Intl.DateTimeFormat(
      "en-GB",
      timeStampOptions
    )
    // Step 2: Append the new log entry
    const newLog = {
      timestamp: timeStampFormatter.format(currentDate),
      activity: logEntry,
    }
    currentLogs.push(newLog)

    // Step 3: Upload the updated logs back to the bucket
    await file.save(JSON.stringify(currentLogs, null, 2), {
      contentType: "application/json",
      resumable: false,
    })

    return NextResponse.json({ message: "Log added successfully" })
  } catch (error) {
    console.log(bucketName)
    console.error("Error logging activity:", error)
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    )
  }
}
