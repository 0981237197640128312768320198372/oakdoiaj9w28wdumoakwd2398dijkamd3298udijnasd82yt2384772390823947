import { NextRequest, NextResponse } from "next/server"
import { getGoogleSheetsData } from "@/app/api/CRUD"

const rangeModels: Record<
  string,
  { appName: string; accessType: string; columns: string[] }
> = {
  "RESELLERFamilyAccess!A12:E": {
    appName: "Netflix Premium",
    accessType: "Family Access (Seller Price)",
    columns: ["email", "password", "expireDate", "orderDate"],
  },
  "RESELLERSharingWithTV!A12:G": {
    appName: "Netflix Premium",
    accessType: "Sharing Access With TV (Seller Price)",
    columns: ["email", "password", "profile", "pin", "expireDate", "orderDate"],
  },
  "RESELLERSharingNoTV!A12:G": {
    appName: "Netflix Premium",
    accessType: "Sharing Access No TV (Seller Price)",
    columns: ["email", "password", "profile", "pin", "expireDate", "orderDate"],
  },
  "FamilyAccess!A12:E": {
    appName: "Netflix Premium",
    accessType: "Family Access",
    columns: ["email", "password", "expireDate", "orderDate"],
  },
  "SharingWithTV!A12:G": {
    appName: "Netflix Premium",
    accessType: "Sharing Access With TV",
    columns: ["email", "password", "profile", "pin", "expireDate", "orderDate"],
  },
  "SharingNoTV!A12:G": {
    appName: "Netflix Premium",
    accessType: "Sharing Access No TV",
    columns: ["email", "password", "profile", "pin", "expireDate", "orderDate"],
  },
  "PrimeVideoSharing!A12:F": {
    appName: "Prime Video",
    accessType: "Sharing Access",
    columns: ["email", "password", "profile", "expireDate", "orderDate"],
  },
  "PrimeVideoFamily!A12:E": {
    appName: "Prime Video",
    accessType: "Family Access",
    columns: ["email", "password", "expireDate", "orderDate"],
  },
}

// Fetch and format data from each range
export async function POST(req: NextRequest) {
  const { secretKey } = await req.json()

  if (!secretKey) {
    return NextResponse.json(
      { error: "Secret key is required" },
      { status: 400 }
    )
  }

  try {
    // Consolidated array to store all matched data
    const consolidatedData: any[] = []

    // Loop through each range and apply the specific model
    for (const [range, model] of Object.entries(rangeModels)) {
      // Fetch data for the current range
      const sheetData =
        (await getGoogleSheetsData(
          process.env.___SPREADSHEET_ID as string,
          range
        )) || []

      // Filter and map rows that match the Secret Key
      const matchedRows = sheetData
        .filter((row: string[]) => row[0] === secretKey) // Match Secret Key in the first column
        .map((row: string[]) => {
          // Start with a formatted row that includes the static app name
          const formattedRow: Record<string, string> = {
            appName: model.appName,
            accessType: model.accessType,
          }

          // Map each remaining column according to the model, skipping the Secret Key
          model.columns.forEach((label: any, index: any) => {
            formattedRow[label] = row[index + 1] // +1 to skip the Secret Key column
          })
          return formattedRow
        })
      // Add matched rows to the consolidated data
      consolidatedData.push(...matchedRows)
    }

    // Return the consolidated data as JSON
    if (consolidatedData.length === 0) {
      return NextResponse.json(
        { error: "No premium data found for this Secret Key" },
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
