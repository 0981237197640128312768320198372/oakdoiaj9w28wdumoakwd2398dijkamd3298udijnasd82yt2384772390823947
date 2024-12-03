import { NextRequest, NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"
import formidable, { File } from "formidable"
import fs from "fs/promises"
import path from "path"
import { Readable } from "stream"
import { IncomingMessage } from "http"

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

// Configuring formidable for file uploads
const uploadDir = path.join(process.cwd(), "/uploads")

const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFileSize: 100 * 1024 * 1024, // 100 MB
  multiples: false, // Ensure single file upload per field
})

// Google Cloud Storage configuration
const storage = new Storage({
  projectId: GCP_PROJECT_ID,
  credentials: {
    client_email: GCP_CLIENT_EMAIL,
    private_key: GCP_PRIVATE_KEY.replace(/\\n/g, "\n"), // Replace escaped newlines
  },
})
const bucketName = GCP_BUCKET_CDN_NAME

// Ensure uploads directory exists
;(async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true })
  } catch (err) {
    console.error("Failed to create upload directory:", err)
  }
})()

// Helper function to convert NextRequest to Node.js IncomingMessage
function nextRequestToIncomingMessage(req: NextRequest): IncomingMessage {
  const readable = new Readable({
    read() {}, // No-op _read
  })

  const body = req.body
  if (!body) throw new Error("Request body is missing")

  const reader = body.getReader()
  const processChunk = async () => {
    const { done, value } = await reader.read()
    if (done) {
      readable.push(null) // End of stream
      return
    }
    readable.push(Buffer.from(value)) // Push chunks
    processChunk() // Continue reading
  }

  processChunk()

  // Convert headers to an object
  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => {
    headers[key] = value
  })

  // Add missing IncomingMessage properties
  const incomingMessage = Object.assign(readable, {
    headers,
    method: req.method || "GET",
    url: req.url || "",
    httpVersion: "1.1", // Default HTTP version
    httpVersionMajor: 1,
    httpVersionMinor: 1,
    connection: null,
    socket: null,
    aborted: false,
  })

  return incomingMessage as unknown as IncomingMessage
}

// POST handler for file upload
export async function POST(req: NextRequest) {
  try {
    const nodeReq = nextRequestToIncomingMessage(req)

    // Extract folder name from query parameters
    const url = new URL(req.url || "", `http://${req.headers.get("host")}`)
    const folderName = url.searchParams.get("foldername") || "default" // Fallback to "default"

    // Parse the incoming form-data request
    const parsedForm: formidable.Files = await new Promise(
      (resolve, reject) => {
        form.parse(nodeReq, (err, fields, files) => {
          if (err) {
            console.error("Formidable Error:", err)
            reject(err)
          } else {
            resolve(files)
          }
        })
      }
    )

    let file: File | undefined = parsedForm.file as File | undefined

    // Handle the case where `file` is an array
    if (Array.isArray(file)) {
      file = file[0]
    }

    if (!file || !file.filepath) {
      console.error("Invalid file received:", file)
      return NextResponse.json(
        { error: "No file uploaded or invalid file" },
        { status: 400 }
      )
    }

    // Upload file to Google Cloud Storage under the specified folder
    const destination = `${folderName}/${Date.now()}-${file.originalFilename}`
    await storage.bucket(bucketName).upload(file.filepath, {
      destination,
      metadata: {
        cacheControl: "public, max-age=31536000", // Cache for 1 year
      },
    })

    // Construct CDN URL
    const cdnUrl = `https://storage.googleapis.com/dokmaicdn10927491083123/${destination}`

    // Clean up the temporary uploaded file
    await fs.unlink(file.filepath)

    return NextResponse.json({ url: cdnUrl })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file", details: (error as Error).message },
      { status: 500 }
    )
  }
}
