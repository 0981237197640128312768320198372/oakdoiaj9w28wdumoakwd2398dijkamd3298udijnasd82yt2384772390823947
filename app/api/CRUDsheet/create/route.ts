import { NextResponse } from "next/server"
import { appendGoogleSheetsData } from "@/app/api/CRUD"
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { spreadsheetId } = body
    const { range } = body
    const { values } = body

    if (!values) {
      return NextResponse.json({ error: "No values provided" }, { status: 400 })
    }

    await appendGoogleSheetsData(spreadsheetId, range, values)

    return NextResponse.json({ message: "Data successfully added" })
  } catch (error) {
    console.error("Error adding data:", error)
    return NextResponse.json({ error: "Error adding data" }, { status: 500 })
  }
}
