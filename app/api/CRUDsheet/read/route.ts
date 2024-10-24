/* eslint-disable prefer-const */
import { NextRequest, NextResponse } from "next/server"
import { getGoogleSheetsData } from "@/app/api/CRUD"

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key")
  const validApiKey = process.env.API_KEY

  if (apiKey !== validApiKey) {
    return NextResponse.json("Unauthorized: Invalid API key", {
      status: 401,
    })
  }

  const { searchParams } = new URL(req.url)
  const sheetName = searchParams.get("sheet") || ""
  const range = searchParams.get("range") || ""
  const columnsParam = searchParams.get("columns")

  let columns = columnsParam ? columnsParam.split(",") : null

  if (columns !== null && columns.some((col) => !/^[A-Z]+$/.test(col))) {
    return NextResponse.json(
      { error: "Invalid columns format" },
      { status: 400 }
    )
  }

  try {
    const data = await getGoogleSheetsData(`${sheetName}!${range}`)

    let processedData = data || []
    if (columns) {
      processedData = processedData.map((row) =>
        columns.map((col) => {
          const colIndex = col.charCodeAt(0) - 65
          return row[colIndex]
        })
      )
    }

    return NextResponse.json({ data: processedData }, { status: 200 })
  } catch (error) {
    console.error("Error reading data", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
