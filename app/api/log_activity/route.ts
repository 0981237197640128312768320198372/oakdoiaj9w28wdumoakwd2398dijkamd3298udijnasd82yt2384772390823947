import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const LOGGING_API_KEY = process.env.LOGGING_API_KEY

export async function POST(request: Request) {
  try {
    // Authenticate with the API key
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey || apiKey !== LOGGING_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const { logEntry } = await request.json()
    if (!logEntry) {
      return NextResponse.json({ error: "Missing log entry" }, { status: 400 })
    }

    // Define the path to the JSON file
    const filePath = path.join(process.cwd(), "data", "logs.json")

    // Read the current logs
    let logs = []
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8")
      logs = JSON.parse(fileContent)
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
    const timeStamp = new Intl.DateTimeFormat("en-GB", timeStampOptions)
    // Add the new log entry with a timestamp
    logs.push({ timestamp: timeStamp.format(currentDate), activity: logEntry })

    // Write the updated logs back to the file
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), "utf8")

    return NextResponse.json({ message: "Log added successfully" })
  } catch (error) {
    console.error("Error logging activity:", error)
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    )
  }
}
