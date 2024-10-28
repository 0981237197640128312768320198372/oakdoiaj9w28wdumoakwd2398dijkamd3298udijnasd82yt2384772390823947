import { NextRequest, NextResponse } from "next/server"
import { findAndUpdateRow } from "@/app/api/CRUD"

// Named export for PATCH request
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { spreadsheetId, range, searchValue, values } = body

    // Validate input
    if (!searchValue || !values) {
      return NextResponse.json(
        { error: "Missing search value or update values" },
        { status: 400 }
      )
    }

    // Call the function to find and update the row
    const response = await findAndUpdateRow(
      spreadsheetId,
      range,
      searchValue,
      values
    )

    // Return success response
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("ERROR in updating row:", error)
    return NextResponse.json({ error: "Failed to update row" }, { status: 500 })
  }
}

// Optionally handle other methods if necessary
export function OPTIONS() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
}
