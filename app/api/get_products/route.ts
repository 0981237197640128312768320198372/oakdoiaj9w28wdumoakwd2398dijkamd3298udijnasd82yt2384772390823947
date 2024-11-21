/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getGoogleSheetsData } from "@/app/api/CRUD"
import { productsConfig } from "@/constant"
import process from "process"

type ProductName = keyof typeof productsConfig

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productName = searchParams.get("name") as ProductName | null
  const fetchAll = searchParams.get("all") === "true"

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

    const selectedProducts = fetchAll
      ? productsConfig
      : productName
      ? { [productName]: productsConfig[productName] }
      : {}

    if (Object.keys(selectedProducts).length === 0) {
      return NextResponse.json(
        { error: "No valid product found" },
        { status: 400 }
      )
    }

    // Process each selected product
    const productDataPromises = Object.entries(selectedProducts).map(
      async ([name, ranges]) => {
        // Match product details based on config name
        const matchedDetails = detailsMap[name] || []

        // Fetch available data for the product
        const availableData = await getGoogleSheetsData(
          process.env.___SPREADSHEET_ID as string,
          ranges.availableDataRange
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
        const filteredAvailableData = normalizedAvailableData
          .map((row: any[], index: number) => ({
            data: row,
            row: index + 12,
          }))
          .filter(
            (item) =>
              item.data[0] === "" &&
              item.data[ranges.expireDateColumnIndex] === ""
          )

        return {
          name,
          details: matchedDetails, // Only include matched details for the product
          stock: filteredAvailableData.length,
          // availableAccounts: filteredAvailableData,
          expireDateColumnIndex: ranges.expireDateColumnIndex,
          totalColumns: ranges.totalColumns,
        }
      }
    )

    const productsData = await Promise.all(productDataPromises)
    return NextResponse.json(productsData)
  } catch (error) {
    console.error("Error fetching products data:", error)
    return NextResponse.json(
      { error: "Failed to fetch product data" },
      { status: 500 }
    )
  }
}
