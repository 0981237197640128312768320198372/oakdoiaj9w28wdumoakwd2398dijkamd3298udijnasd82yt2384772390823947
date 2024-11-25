import { NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"

// Initialize GCS Client
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
})

const bucketName = process.env.GCP_BUCKET_NAME || ""
const fileName = "logs.jsonl"
const validApiKey = process.env.LOGGING_API_KEY

export async function POST(req: Request) {
  try {
    // Check API Key
    const apiKey = req.headers.get("x-api-key")
    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid or missing API key." },
        { status: 401 }
      )
    }

    // Parse the log entry from request body
    const { logEntry } = await req.json()
    if (!logEntry) {
      return NextResponse.json(
        { error: "Log entry is required." },
        { status: 400 }
      )
    }

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(fileName)

    const logLine = logEntry

    // Check if the file exists
    const [exists] = await file.exists()
    let currentContent = ""

    if (exists) {
      // Read the existing file content
      const [contents] = await file.download()
      currentContent = contents.toString()
    }

    // Append the new log entry
    const updatedContent = currentContent + logLine

    // Write back the updated content
    await file.save(updatedContent)

    return NextResponse.json({ message: "Log added successfully." })
  } catch (error) {
    console.error("Error logging activity:", error)
    return NextResponse.json(
      { error: "Failed to log activity." },
      { status: 500 }
    )
  }
}
