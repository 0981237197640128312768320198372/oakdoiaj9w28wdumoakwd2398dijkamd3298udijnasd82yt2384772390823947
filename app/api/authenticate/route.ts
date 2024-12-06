/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"

const { GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY, GCP_BUCKET_NAME } =
  process.env

if (
  !GCP_PROJECT_ID ||
  !GCP_CLIENT_EMAIL ||
  !GCP_PRIVATE_KEY ||
  !GCP_BUCKET_NAME
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

const bucketName = GCP_BUCKET_NAME
const userFileName = "adminAndStaff.json"
const blockFileName = "blocked.json"
const MAX_ATTEMPTS = 5

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("cf-connecting-ip") ||
      "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"

    const bucket = storage.bucket(bucketName)
    const userFile = bucket.file(userFileName)
    const blockFile = bucket.file(blockFileName)

    // Check if the blocked file exists
    const [blockFileExists] = await blockFile.exists()
    let blockedData: Record<string, any> = {}

    if (blockFileExists) {
      const [blockContents] = await blockFile.download()
      blockedData = JSON.parse(blockContents.toString())
    }

    const blockKey = `${ip}__${userAgent}`

    if (blockedData[blockKey]?.blockedAt) {
      return NextResponse.json(
        {
          error: "Something Wrong.",
        },
        { status: 403 }
      )
    }

    // Fetch users
    const [userFileExists] = await userFile.exists()
    if (!userFileExists) {
      return NextResponse.json(
        { error: "User database not found" },
        { status: 500 }
      )
    }

    const [contents] = await userFile.download()
    const users = JSON.parse(contents.toString())

    // Check credentials
    const user = users.find(
      (u: { username: string; password: string }) =>
        u.username === username && u.password === password
    )

    if (!user) {
      // Increment failed attempts for this IP + User-Agent
      if (!blockedData[blockKey]) {
        blockedData[blockKey] = { attempts: 0 }
      }

      blockedData[blockKey].attempts += 1

      // Block if max attempts are exceeded
      if (blockedData[blockKey].attempts >= MAX_ATTEMPTS) {
        blockedData[blockKey].blockedAt = Date.now()
      }

      // Update the blocked file
      await blockFile.save(JSON.stringify(blockedData, null, 2), {
        contentType: "application/json",
      })

      return NextResponse.json(
        {
          error: "Invalid credentials.",
        },
        { status: 401 }
      )
    }

    // Successful authentication: Reset attempts for IP + User-Agent
    delete blockedData[blockKey]

    await blockFile.save(JSON.stringify(blockedData, null, 2), {
      contentType: "application/json",
    })

    // Only send non-sensitive user information
    return NextResponse.json({ role: user.role })
  } catch (error) {
    console.error("Error authenticating user:", error)
    return NextResponse.json(
      { error: "Authentication failed." },
      { status: 500 }
    )
  }
}
