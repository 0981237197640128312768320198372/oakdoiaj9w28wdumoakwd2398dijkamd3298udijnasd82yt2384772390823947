/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { getGoogleSheetsData } from "@/app/api/CRUD"
import { productsConfig } from "@/constant"

interface RangeModel {
  appName: string
  accessType: string
  columns: string[]
}

const rangeModels: Record<string, RangeModel> = Object.entries(
  productsConfig
).reduce((acc, [key, value]) => {
  const appName = key.includes("PrimeVideo") ? "Prime Video" : "Netflix Premium"
  const accessType = key
    .replace(/([A-Z])/g, " $1")
    .replace(/Reseller Price/g, "(Seller Price)")
    .trim()
  const columns = Array.from({ length: value.totalColumns - 1 }, (_, i) => {
    switch (i) {
      case 0:
        return "email"
      case 1:
        return "password"
      case 2:
        return "profile"
      case 3:
        return "pin"
      case value.expireDateColumnIndex - 1:
        return "expireDate"
      case value.expireDateColumnIndex:
        return "orderDate"
      default:
        return `column${i}`
    }
  }).filter(Boolean)

  acc[value.availableDataRange] = { appName, accessType, columns }
  return acc
}, {} as Record<string, RangeModel>)

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
