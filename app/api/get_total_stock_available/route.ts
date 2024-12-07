/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getGoogleSheetsData } from "@/app/api/CRUD"
import { productsConfig } from "@/constant"
import process from "process"

export async function GET() {
  try {
    const spreadsheetId = process.env.___SPREADSHEET_ID as string

    // Fetch all product details in one go
    const allDetailsPromise = getGoogleSheetsData(
      spreadsheetId,
      "PRODUCTS!A2:D"
    )

    // Fetch available data for all products
    const productStocksPromises = Object.entries(productsConfig).map(
      async ([_, ranges]) =>
        getGoogleSheetsData(spreadsheetId, ranges.availableDataRange, "second")
    )

    const [allDetails, ...allProductsData] = await Promise.all([
      allDetailsPromise,
      ...productStocksPromises,
    ])

    // Map product details to configurations
    const detailsMap = (allDetails || []).reduce(
      (map: Record<string, any[]>, row) => {
        const [appName, typeAccess, duration, price] = row
        if (!appName || !typeAccess || !duration || !price) return map

        const configKey = `${appName.trim()}${typeAccess.trim()}`.replace(
          /\s+/g,
          ""
        )
        if (!map[configKey]) map[configKey] = []
        map[configKey].push({ duration, price })
        return map
      },
      {}
    )

    // Calculate total stock
    const totalStock = allProductsData.reduce((total, productData, index) => {
      const ranges = Object.entries(productsConfig)[index][1]
      const normalizedAvailableData = (productData || []).filter(
        (row: any[]) =>
          row[0] === "" && row[ranges.expireDateColumnIndex] === ""
      )

      console.log("AVAILABLE DATA LENGHT:", normalizedAvailableData.length)
      return total + normalizedAvailableData.length
    }, 0)

    console.log("STOCK:", totalStock)
    return NextResponse.json({ totalStock })
  } catch (error) {
    console.error("Error fetching total stock:", error)
    return NextResponse.json(
      { error: "Failed to fetch total stock" },
      { status: 500 }
    )
  }
}
