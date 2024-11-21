/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getGoogleSheetsData, manageProductData } from "@/app/api/CRUD"
import { productsConfig } from "@/constant"
import process from "process"

type SelectedProduct = {
  name: string
  quantity: number
  duration: string
}

type ProductName = keyof typeof productsConfig

export async function POST(request: Request) {
  try {
    const { personalKey, selectedProducts } = (await request.json()) as {
      personalKey: string
      selectedProducts: SelectedProduct[]
    }

    if (!personalKey || !selectedProducts || selectedProducts.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: Missing personal key or products" },
        { status: 400 }
      )
    }

    const userInfo =
      (await getGoogleSheetsData(
        process.env.___SPREADSHEET_ID as string,
        "UserInfo!A2:D"
      )) || []

    const user = userInfo.find((row: any[]) => row[0] === personalKey)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userBalance = parseFloat(user[1])
    const userContact = user[3]

    const secureProductData = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/get_secure_products`,
      {
        headers: {
          "x-api-key": process.env.SECURE_API_KEY || "", // Pass the secure API key
        },
      }
    )
      .then((res) => res.json())
      .catch((error) => {
        console.error("Error fetching secure product data:", error)
        return null
      })

    if (!secureProductData) {
      return NextResponse.json(
        { error: "Failed to retrieve product data" },
        { status: 500 }
      )
    }

    let calculatedTotalCost = 0
    const unavailableProducts: string[] = []
    const batchUpdates: Record<string, any[]> = {}

    for (const { name, quantity, duration } of selectedProducts) {
      const productConfig = productsConfig[name as ProductName]
      const secureProduct = secureProductData.find((p: any) => p.name === name)

      if (!productConfig || !secureProduct || secureProduct.stock < quantity) {
        unavailableProducts.push(name)
        continue
      }

      const productPrice = parseFloat(secureProduct.details[0].price)
      calculatedTotalCost += productPrice * quantity

      const sheetName = productConfig.availableDataRange.split("!")[0]
      const expireDateColumnIndex = productConfig.expireDateColumnIndex

      for (let i = 0; i < quantity; i++) {
        const availableAccount = secureProduct.availableAccounts.shift()

        if (!availableAccount || availableAccount.data[0] !== "") {
          console.warn("No valid available account found for the product.")
          unavailableProducts.push(name)
          continue
        }

        const row = availableAccount.row

        const durationDays = parseInt(duration.split(" ")[0], 10)
        if (isNaN(durationDays) || durationDays <= 0) {
          console.error(`Invalid duration provided: ${duration}`)
          continue
        }

        const expireDate = new Date()
        expireDate.setDate(expireDate.getDate() + durationDays)

        const formattedExpireDate = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Bangkok",
          day: "2-digit",
          month: "long",
        }).format(expireDate)

        const currentDate = new Date()
        const options: Intl.DateTimeFormatOptions = {
          timeZone: "Asia/Bangkok",
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }

        const formattedOrderDate = new Intl.DateTimeFormat(
          "en-GB",
          options
        ).format(currentDate)

        // Ensure the formattedExpireDate retains the YYYY-MM-DD format
        const [year, month, day] = formattedExpireDate.split("-")
        const finalFormattedExpireDate = `${year}-${month}-${day}`

        if (!batchUpdates[sheetName]) batchUpdates[sheetName] = []
        batchUpdates[sheetName].push({
          row,
          updates: {
            personalKey,
            expireDate: finalFormattedExpireDate,
            orderDate: formattedOrderDate,
            contact: userContact,
          },
          expireDateColumnIndex,
        })
      }
    }

    if (unavailableProducts.length > 0) {
      return NextResponse.json(
        { error: "Some products are out of stock", unavailableProducts },
        { status: 400 }
      )
    }

    if (userBalance < calculatedTotalCost) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          requiredBalance: calculatedTotalCost,
          currentBalance: userBalance,
        },
        { status: 400 }
      )
    }

    await Promise.all(
      Object.entries(batchUpdates).map(([sheetName, updates]) =>
        Promise.all(
          updates.map(({ row, updates, expireDateColumnIndex }) =>
            manageProductData(
              process.env.___SPREADSHEET_ID as string,
              sheetName,
              row,
              updates,
              expireDateColumnIndex
            )
          )
        )
      )
    )

    return NextResponse.json({
      message: "Checkout successful",
      userContact,
      totalCost: calculatedTotalCost,
    })
  } catch (error) {
    console.error("Error during checkout verification:", error)
    return NextResponse.json(
      { error: "Failed to verify checkout" },
      { status: 500 }
    )
  }
}
