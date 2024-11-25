import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const LOGGING_API_KEY = process.env.LOGGING_API_KEY

export async function GET(request: Request) {
  try {
    // Authenticate with the API key
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey || apiKey !== LOGGING_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Define the path to the JSON file
    const filePath = path.join(process.cwd(), "data", "logs.json")

    // Read the logs
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ logs: [] }, { status: 200 })
    }

    const fileContent = fs.readFileSync(filePath, "utf8")
    const logs = JSON.parse(fileContent)

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error reading logs:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
