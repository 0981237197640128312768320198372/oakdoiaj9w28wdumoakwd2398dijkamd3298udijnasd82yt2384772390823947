import { NextResponse } from "next/server"
import { getGoogleSheetsData, updateUserField } from "@/app/api/CRUD"
import process from "process"

export async function POST(request: Request) {
  try {
    const { personalKey, purchaseTotal } = await request.json()

    const userInfoSheetRange = "UserInfo!A2:D"

    const userData =
      (await getGoogleSheetsData(
        process.env.___SPREADSHEET_ID as string,
        userInfoSheetRange,
      )) || []

    const userRow = userData.findIndex((row) => row[0] === personalKey)

    if (userRow === -1) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    const currentBalance = parseFloat(userData[userRow][1])

    const newBalance = currentBalance - purchaseTotal
    if (newBalance < 0) {
      return NextResponse.json(
        { error: "Insufficient balance." },
        { status: 400 },
      )
    }

    await updateUserField(
      process.env.___SPREADSHEET_ID as string,
      "UserInfo",
      "A",
      personalKey,
      "B",
      newBalance.toString(),
    )

    return NextResponse.json({
      message: "Balance updated successfully",
      newBalance,
    })
  } catch (error) {
    console.error("Error updating balance:", error)
    return NextResponse.json(
      { error: "Failed to update balance" },
      { status: 500 },
    )
  }
}
