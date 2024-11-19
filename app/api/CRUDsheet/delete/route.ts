import { NextRequest, NextResponse } from "next/server"
import { findAndDeleteRow } from "@/app/api/CRUD"

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { sheetName, searchValue } = body

    if (!sheetName || !searchValue) {
      return NextResponse.json(
        { error: "Missing sheet name or search value" },
        { status: 400 },
      )
    }

    const response = await findAndDeleteRow(sheetName, searchValue)
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("ERROR in deleting row:", error)
    return NextResponse.json({ error: "Failed to delete row" }, { status: 500 })
  }
}
