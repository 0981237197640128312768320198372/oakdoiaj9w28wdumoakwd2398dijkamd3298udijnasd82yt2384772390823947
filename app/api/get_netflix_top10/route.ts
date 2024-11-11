/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server"

// Define types for the expected structure of the data
interface DataItem {
  id: string
  showId: string
  category?: string
  rank?: string
  showName?: string
  seasonName?: string
  horizontal?: string
}

export async function GET() {
  try {
    // Fetch data from all URLs
    const [dataRes, namesRes, boxartRes] = await Promise.all([
      fetch(
        "https://www.netflix.com/tudum/top10/data/weeks/20241027-data.json"
      ),
      fetch(
        "https://www.netflix.com/tudum/top10/data/weeks/20241027-en-names.json"
      ),
      fetch(
        "https://www.netflix.com/tudum/top10/data/weeks/20241027-th-boxart.json"
      ),
    ])

    // Parse JSON responses
    const dataJson = await dataRes.json()
    const namesJson = await namesRes.json()
    const boxartJson = await boxartRes.json()

    const thailandData =
      dataJson.countries.find(
        (countryEntry: any) => countryEntry[0] === "TH"
      )?.[1] || []

    // Map over Thailand's data items and extract required fields
    const dataItems = thailandData.map((item: any) => ({
      id: item.id,
      showId: item.showId,
      category: item.category,
      rank: item.rank,
    }))
    // Create dictionaries for quick access to names and boxart by `id`
    const namesMap = Object.fromEntries(
      namesJson.map((item: any) => [item.id, item])
    )
    const boxartMap = Object.fromEntries(
      boxartJson.map((item: any) => [item.id, item])
    )

    // Merge the data based on `id`
    const mergedData: DataItem[] = dataItems.map((item: DataItem) => ({
      ...item,
      showName: namesMap[item.id]?.showName,
      seasonName:
        namesMap[item.id]?.seasonName &&
        namesMap[item.id]?.seasonName !== namesMap[item.id]?.showName
          ? namesMap[item.id]?.seasonName
          : undefined,
      horizontal: boxartMap[item.id]?.horizontal,
      vertical: boxartMap[item.id]?.vertical,
    }))

    console.log(mergedData)
    // Return the merged data as a JSON response
    return NextResponse.json(mergedData)
  } catch (error) {
    console.error("Failed to fetch or process data:", error)
    return NextResponse.json(
      { error: "Failed to fetch or process data" },
      { status: 500 }
    )
  }
}
