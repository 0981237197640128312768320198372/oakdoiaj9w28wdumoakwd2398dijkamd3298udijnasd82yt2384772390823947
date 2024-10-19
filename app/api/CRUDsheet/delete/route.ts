import { NextRequest, NextResponse } from "next/server"
import { findAndDeleteRow } from "@/app/api/CRUD"

// Named export for DELETE request
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { sheetName, searchValue } = body

    // Validate the sheet name and search value
    if (!sheetName || !searchValue) {
      return NextResponse.json(
        { error: "Missing sheet name or search value" },
        { status: 400 }
      )
    }

    // Call the findAndDeleteRow function with dynamic sheet name and search value
    const response = await findAndDeleteRow(sheetName, searchValue)

    // Return success response
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("ERROR in deleting row:", error)
    return NextResponse.json({ error: "Failed to delete row" }, { status: 500 })
  }
}
