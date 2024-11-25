import { NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"

// Initialize GCS Client
const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n")
if (!privateKey) {
  throw new Error(
    "GCP_PRIVATE_KEY is not defined in the environment variables."
  )
}

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: privateKey,
  },
})

const bucketName = process.env.GCP_BUCKET_NAME || ""

export async function POST(req: Request) {
  try {
    const { logEntry } = await req.json()

    if (!logEntry) {
      return NextResponse.json(
        { error: "Log entry is required." },
        { status: 400 }
      )
    }

    const timestamp = new Date().toISOString()
    const newLog = `[${timestamp}] | ${logEntry}\n`

    const bucket = storage.bucket(bucketName)
    const fileName = "logs.jsonl"
    const file = bucket.file(fileName)

    let existingLogs = ""

    try {
      const [contents] = await file.download()
      existingLogs = contents.toString()
    } catch (error) {
      console.log("Log file does not exist, creating a new one.")
    }

    const updatedLogs = existingLogs + newLog
    await file.save(updatedLogs, {
      contentType: "text/plain",
      resumable: false,
    })

    return NextResponse.json({ message: "Log added successfully." })
  } catch (error) {
    console.error("Error logging activity:", error)
    return NextResponse.json(
      { error: "Failed to log activity." },
      { status: 500 }
    )
  }
}
