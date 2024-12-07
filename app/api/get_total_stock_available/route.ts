/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getGoogleSheetsData } from "@/app/api/CRUD"
import { productsConfig } from "@/constant"
import process from "process"

export async function GET() {
  try {
    // Fetch all product details from Google Sheets
    const allDetails =
      (await getGoogleSheetsData(
        process.env.___SPREADSHEET_ID as string,
        "PRODUCTS!A2:D"
      )) || []

    // Transform details to map with productConfig keys
    const detailsMap = allDetails.reduce((map: Record<string, any[]>, row) => {
      const [appName, typeAccess, duration, price] = row

      if (!appName || !typeAccess || !duration || !price) return map // Skip invalid rows

      // Generate key matching ProductConfig name (remove spaces, combine appName + typeAccess)
      const configKey = `${appName.trim()}${typeAccess.trim()}`.replace(
        /\s+/g,
        ""
      )

      if (!map[configKey]) map[configKey] = []
      map[configKey].push({ duration, price }) // Push matching details under the key
      return map
    }, {})

    // Process all products and calculate total stock
    const productDataPromises = Object.entries(productsConfig).map(
      async ([name, ranges]) => {
        // Fetch available data for the product
        const availableData = await getGoogleSheetsData(
          process.env.___SPREADSHEET_ID as string,
          ranges.availableDataRange,
          "second"
        )

        // Normalize available data
        const normalizedAvailableData = (availableData || []).map(
          (row: any[]) => {
            while (row.length < ranges.totalColumns) {
              row.push("")
            }
            return row
          }
        )

        // Filter available accounts
        const filteredAvailableData = normalizedAvailableData.filter(
          (row: any[]) =>
            row[0] === "" && row[ranges.expireDateColumnIndex] === ""
        )

        return filteredAvailableData.length // Return stock count for this product
      }
    )

    const stockCounts = await Promise.all(productDataPromises)

    // Calculate the total stock
    const totalStock = stockCounts.reduce((total, stock) => total + stock, 0)
    // console.log("STOCK:", totalStock)
    return NextResponse.json({ totalStock })
  } catch (error) {
    console.error("Error fetching total stock:", error)
    return NextResponse.json(
      { error: "Failed to fetch total stock" },
      { status: 500 }
    )
  }
}
