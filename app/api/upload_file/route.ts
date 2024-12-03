import { NextRequest, NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"
import { Readable } from "stream"

// Validate required environment variables
const {
  GCP_PROJECT_ID,
  GCP_CLIENT_EMAIL,
  GCP_PRIVATE_KEY,
  GCP_BUCKET_CDN_NAME,
} = process.env

if (
  !GCP_PROJECT_ID ||
  !GCP_CLIENT_EMAIL ||
  !GCP_PRIVATE_KEY ||
  !GCP_BUCKET_CDN_NAME
) {
  throw new Error("Missing required Google Cloud environment variables.")
}

const storage = new Storage({
  projectId: GCP_PROJECT_ID,
  credentials: {
    client_email: GCP_CLIENT_EMAIL,
    private_key: GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
})
const bucketName = GCP_BUCKET_CDN_NAME

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${Date.now()}-${file.name}`
    const destination = `help_images/${fileName}`

    console.log(`Uploading to bucket: ${bucketName}`)
    console.log(`Destination path: ${destination}`)

    const bucketFile = storage.bucket(bucketName).file(destination)

    const writeStream = bucketFile.createWriteStream({
      resumable: true,
      metadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000",
      },
    })

    const readableFileStream = Readable.from(fileBuffer)
    readableFileStream.pipe(writeStream)

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve)
      writeStream.on("error", reject)
    })

    console.log("Upload completed successfully")

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(
      destination
    )}`
    return NextResponse.json({ publicUrl })
  } catch (error) {
    console.error("Error in file upload:", error)
    return NextResponse.json(
      { error: "Failed to upload file", details: error },
      { status: 500 }
    )
  }
}
