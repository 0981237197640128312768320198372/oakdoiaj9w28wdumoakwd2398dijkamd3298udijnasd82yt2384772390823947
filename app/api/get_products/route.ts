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

    const productDataPromises = Object.entries(selectedProducts).map(
      async ([name, ranges]) => {
        const [detailData, availableData] = await Promise.all([
          getGoogleSheetsData(
            process.env.___SPREADSHEET_ID as string,
            ranges.detailRange
          ),
          getGoogleSheetsData(
            process.env.___SPREADSHEET_ID as string,
            ranges.availableDataRange
          ),
        ])
        const normalizedAvailableData = (availableData || []).map(
          (row: any[]) => {
            while (row.length < ranges.totalColumns) {
              row.push("")
            }
            return row
          }
        )

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
          details: (detailData || [])
            .filter(
              (item): item is [string, string] =>
                Array.isArray(item) && item.length === 2
            )
            .map(([duration, price]) => ({
              duration,
              price,
            })),
          stock: filteredAvailableData.length,
          availableAccounts: filteredAvailableData,
          expireDateColumnIndex: ranges.expireDateColumnIndex,
          totalColumns: ranges.totalColumns,
        }
      }
    )
    const productsData = await Promise.all(productDataPromises)
    return NextResponse.json(productsData)
  } catch (error) {
    console.error("ERROR ERROR ERROR ERROR ERROR ERROR ", error)
    return NextResponse.json(
      { error: "Failed to fetch product data" },
      { status: 500 }
    )
  }
}
