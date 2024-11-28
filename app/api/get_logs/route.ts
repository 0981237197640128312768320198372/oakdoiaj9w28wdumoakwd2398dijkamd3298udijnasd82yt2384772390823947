/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
})

const bucketName = process.env.GCP_BUCKET_NAME || ""
const logFileName = "activity_logs.json"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const logType = url.searchParams.get("type") || "All"

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(logFileName)

    const [exists] = await file.exists()

    if (!exists) {
      return NextResponse.json(
        { message: "Log file does not exist", logs: [] },
        { status: 404 }
      )
    }

    const [contents] = await file.download()
    const logs = JSON.parse(contents.toString())

    // Filter logs based on type if provided
    const filteredLogs =
      logType === "All"
        ? logs
        : logs.filter((log: any) => log.activity?.type === logType)

    // Sort logs by timestamp in descending order
    const sortedLogs = filteredLogs.sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({ logs: sortedLogs.reverse() }, { status: 200 })
  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
