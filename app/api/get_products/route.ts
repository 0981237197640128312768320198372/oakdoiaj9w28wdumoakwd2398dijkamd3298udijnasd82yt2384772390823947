import { NextResponse } from "next/server"
import { getGoogleSheetsData } from "@/app/api/CRUD"
import process from "process"

export async function GET() {
  try {
    const products = {
      PrimeVideoSharingAccess: {
        detailRange: "PRODUCTS!A3:B",
        stockRange: "PRODUCTS!B1",
        availableDataRange: "PrimeVideoSharing!A12:H",
        expireDateColumnIndex: 4,
        totalColumns: 8, // Specifies the expected number of columns
      },
      PrimeVideoFamilyAccess: {
        detailRange: "PRODUCTS!D3:E",
        stockRange: "PRODUCTS!E1",
        availableDataRange: "PrimeVideoFamily!A12:G",
        expireDateColumnIndex: 3,
        totalColumns: 7,
      },
      NetflixPremiumSharingNoTV: {
        detailRange: "PRODUCTS!G3:H",
        stockRange: "PRODUCTS!H1",
        availableDataRange: "SharingNoTV!A12:I",
        expireDateColumnIndex: 5,
        totalColumns: 9,
      },
      NetflixPremiumSharingWithTV: {
        detailRange: "PRODUCTS!J3:K",
        stockRange: "PRODUCTS!K1",
        availableDataRange: "SharingWithTV!A12:I",
        expireDateColumnIndex: 5,
        totalColumns: 9,
      },
      NetflixPremiumFamilyAccess: {
        detailRange: "PRODUCTS!M3:N",
        stockRange: "PRODUCTS!N1",
        availableDataRange: "FamilyAccess!A12:G",
        expireDateColumnIndex: 3,
        totalColumns: 7,
      },
      NetflixPremiumSharingNoTVResellerPrice: {
        detailRange: "PRODUCTS!P3:Q",
        stockRange: "PRODUCTS!Q1",
        availableDataRange: "RESELLERSharingNoTV!A12:I",
        expireDateColumnIndex: 5,
        totalColumns: 9,
      },
      NetflixPremiumSharingWithTVResellerPrice: {
        detailRange: "PRODUCTS!S3:T",
        stockRange: "PRODUCTS!T1",
        availableDataRange: "RESELLERSharingWithTV!A12:I",
        expireDateColumnIndex: 5,
        totalColumns: 9,
      },
      NetflixPremiumFamilyAccessResellerPrice: {
        detailRange: "PRODUCTS!V3:W",
        stockRange: "PRODUCTS!W1",
        availableDataRange: "RESELLERFamilyAccess!A12:G",
        expireDateColumnIndex: 3,
        totalColumns: 7,
      },
    }

    const productDataPromises = Object.entries(products).map(
      async ([name, ranges]) => {
        const [detailData, stockData, availableData] = await Promise.all([
          getGoogleSheetsData(
            process.env.___SPREADSHEET_ID as string,
            ranges.detailRange
          ),
          getGoogleSheetsData(
            process.env.___SPREADSHEET_ID as string,
            ranges.stockRange
          ),
          getGoogleSheetsData(
            process.env.___SPREADSHEET_ID as string,
            ranges.availableDataRange
          ),
        ])

        // Normalize each row to have a consistent number of columns
        const normalizedAvailableData = (availableData || []).map(
          (row: any[]) => {
            while (row.length < ranges.totalColumns) {
              row.push("") // Add empty strings for missing columns
            }
            return row
          }
        )

        const filteredAvailableData = normalizedAvailableData
          .map((row: any[], index: number) => ({
            data: row,
            row: index + 12, // Add the range header offset (e.g., starting row is 12)
          }))
          .filter(
            (item) =>
              item.data[0] === "" &&
              item.data[ranges.expireDateColumnIndex] === ""
          )
        // console.log(filteredAvailableData)
        // console.log(ranges.expireDateColumnIndex)
        return {
          name,
          details: (detailData || [])
            .filter(
              (item): item is [string, string] =>
                Array.isArray(item) && item.length === 2
            )
            .map(([duration, price]) => ({
              duration,
              price,
            })),
          stock: parseInt(stockData?.[0]?.[0] || "0", 10),
          availableAccounts: filteredAvailableData,
          availableDataRange: ranges.availableDataRange,
          expireDateColumnIndex: ranges.expireDateColumnIndex,
          totalColumns: ranges.totalColumns,
        }
      }
    )
    const productsData = await Promise.all(productDataPromises)
    // productsData.forEach((product) => {
    //   console.log(`Product: ${product.name}`)
    //   console.log("Available Accounts:", product.availableAccounts)
    // })
    return NextResponse.json(productsData)
  } catch (error) {
    console.error("Error fetching products data:", error)
    return NextResponse.json(
      { error: "Failed to fetch product data" },
      { status: 500 }
    )
  }
}
