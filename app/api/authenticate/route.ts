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
const userFileName = "users.json"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    // Fetch the JSON file from Google Storage
    const bucket = storage.bucket(bucketName)
    const file = bucket.file(userFileName)

    const [exists] = await file.exists()
    if (!exists) {
      return NextResponse.json(
        { error: "User database not found" },
        { status: 500 }
      )
    }

    const [contents] = await file.download()
    const users = JSON.parse(contents.toString())

    // Check credentials
    const user = users.find(
      (u: { username: string; password: string }) =>
        u.username === username && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    return NextResponse.json({ role: user.role })
  } catch (error) {
    console.error("Error authenticating user:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}
