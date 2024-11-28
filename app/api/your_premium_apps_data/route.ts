/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { getGoogleSheetsData } from "@/app/api/CRUD"

const rangeModels: Record<
  string,
  { appName: string; accessType: string; columns: string[] }
> = {
  "RESELLERFamilyAccess!A12:G": {
    appName: "Netflix Premium",
    accessType: "Family Access (Seller Price)",
    columns: ["email", "password", "expireDate", "orderDate"],
  },
  "RESELLERSharingWithTV!A12:I": {
    appName: "Netflix Premium",
    accessType: "Sharing Access With TV (Seller Price)",
    columns: ["email", "password", "profile", "pin", "expireDate", "orderDate"],
  },
  "RESELLERSharingNoTV!A12:I": {
    appName: "Netflix Premium",
    accessType: "Sharing Access No TV (Seller Price)",
    columns: ["email", "password", "profile", "pin", "expireDate", "orderDate"],
  },
  "FamilyAccess!A12:G": {
    appName: "Netflix Premium",
    accessType: "Family Access",
    columns: ["email", "password", "expireDate", "orderDate"],
  },
  "SharingWithTV!A12:I": {
    appName: "Netflix Premium",
    accessType: "Sharing Access With TV",
    columns: ["email", "password", "profile", "pin", "expireDate", "orderDate"],
  },
  "SharingNoTV!A12:I": {
    appName: "Netflix Premium",
    accessType: "Sharing Access No TV",
    columns: ["email", "password", "profile", "pin", "expireDate", "orderDate"],
  },
  "PrimeVideoSharing!A12:H": {
    appName: "Prime Video",
    accessType: "Sharing Access",
    columns: ["email", "password", "profile", "pin", "expireDate", "orderDate"],
  },
  "PrimeVideoFamily!A12:G": {
    appName: "Prime Video",
    accessType: "Family Access",
    columns: ["email", "password", "expireDate", "orderDate"],
  },
}

export async function POST(req: NextRequest) {
  const { personalKey } = await req.json()

  if (!personalKey) {
    return NextResponse.json(
      { error: "Personal key is required" },
      { status: 400 }
    )
  }

  try {
    const consolidatedData: any[] = []
    for (const [range, model] of Object.entries(rangeModels)) {
      const sheetData =
        (await getGoogleSheetsData(
          process.env.___SPREADSHEET_ID as string,
          range
        )) || []

      const matchedRows = sheetData
        .filter((row: string[]) => row[0] === personalKey)
        .map((row: string[]) => {
          const formattedRow: Record<string, string> = {
            appName: model.appName,
            accessType: model.accessType,
          }

          model.columns.forEach((label: any, index: any) => {
            formattedRow[label] = row[index + 1]
          })
          return formattedRow
        })
      consolidatedData.push(...matchedRows)
    }

    if (consolidatedData.length === 0) {
      return NextResponse.json(
        { error: "No premium data found for this Personal Key" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: consolidatedData }, { status: 200 })
  } catch (error) {
    console.error("Error reading data", error)
    return NextResponse.json(
      { error: "Failed to fetch premium apps data" },
      { status: 500 }
    )
  }
}
