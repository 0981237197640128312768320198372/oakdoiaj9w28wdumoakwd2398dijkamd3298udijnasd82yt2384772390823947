import { NextRequest, NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
})

const bucketName = process.env.GCP_BUCKET_NAME || ""
const fileName = "helps.json"

export async function GET(req: NextRequest) {
  try {
    // Check if fetchall=true is present in the query string
    const url = new URL(req.url)
    const fetchAll = url.searchParams.get("fetchall") === "true"

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(fileName)

    const [exists] = await file.exists()
    if (!exists) {
      return NextResponse.json(
        { message: "File does not exist", helps: [] },
        { status: 404 }
      )
    }

    let helps = []
    if (fetchAll) {
      // Always read fresh data from the storage bucket
      const [contents] = await file.download()
      helps = JSON.parse(contents.toString())
    }

    return NextResponse.json({ helps }, { status: 200 })
  } catch (error) {
    console.error("Error fetching helps.json:", error)
    return NextResponse.json(
      { error: "Failed to fetch helps.json" },
      { status: 500 }
    )
  }
}
