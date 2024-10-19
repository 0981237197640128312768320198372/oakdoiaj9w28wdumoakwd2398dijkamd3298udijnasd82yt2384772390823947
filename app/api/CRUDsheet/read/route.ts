import { NextRequest, NextResponse } from "next/server"
import { getGoogleSheetsData } from "@/app/api/CRUD"

export async function GET(req: NextRequest) {
  // Get API key from headers
  const apiKey = req.headers.get("x-api-key")

  // Check if the API key matches the one in the environment variables
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json("WHAT ARE YOU LOOKING FOR? BITCH!", {
      status: 401,
    })
  }

  try {
    // If the API key is valid, proceed with fetching the data
    const data = await getGoogleSheetsData("EmailAccess!A1:B10") // Example range
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("Error reading data", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
