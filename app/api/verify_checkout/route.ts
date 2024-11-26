/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import {
  getGoogleSheetsData,
  manageProductData,
  updateUserField,
} from "@/app/api/CRUD"
import { productsConfig } from "@/constant"
import process from "process"

type SelectedProduct = {
  name: string
  quantity: number
  duration: string
  price: number
}

type ProductName = keyof typeof productsConfig

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number,
  delay: number
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      if (
        attempt === retries ||
        !error.message.includes("Quota exceeded for quota metric")
      ) {
        throw error // Throw the error if retries are exhausted or it's not a quota error
      }
      console.warn(`Retrying operation after error: ${error.message}`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error("Operation failed after retries")
}
function formatProductName(name: string): string {
  return name.replace(/([A-Z])/g, " $1").trim()
}

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

    // Fetch user data with retry mechanism
    const userInfoSheetRange = "UserInfo!A2:D"
    const userInfo =
      (await retryOperation(
        () =>
          getGoogleSheetsData(
            process.env.___SPREADSHEET_ID as string,
            userInfoSheetRange
          ),
        3, // Retries
        5000 // Delay in ms
      )) || []

    const userRow = userInfo.findIndex((row: any[]) => row[0] === personalKey)
    if (userRow === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentBalance = parseFloat(userInfo[userRow][1])
    const userContact = userInfo[userRow][3]

    // Fetch secure product data with retry mechanism
    const secureProductData = await retryOperation(
      () =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get_secure_products`, {
          headers: {
            "x-api-key": process.env.SECURE_API_KEY || "",
          },
        }).then((res) => res.json()),
      3,
      5000
    )

    if (!secureProductData) {
      return NextResponse.json(
        { error: "Failed to retrieve product data" },
        { status: 500 }
      )
    }

    let calculatedTotalCost = 0
    const unavailableProducts: string[] = []
    const batchUpdates: Record<string, any[]> = {}

    // Process selected products
    for (const { name, quantity, duration, price } of selectedProducts) {
      const productConfig = productsConfig[name as ProductName]
      const secureProduct = secureProductData.find((p: any) => p.name === name)

      if (!productConfig || !secureProduct || secureProduct.stock < quantity) {
        unavailableProducts.push(name)
        continue
      }

      calculatedTotalCost += price * quantity

      // console.log("PRICE", price)
      // console.log("QUANTITY", quantity)
      // console.log("CALCULATED COST", calculatedTotalCost)
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

        const currentDate = new Date()

        const orderDateOptions: Intl.DateTimeFormatOptions = {
          timeZone: "Asia/Bangkok",
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }

        const expireDateOptions: Intl.DateTimeFormatOptions = {
          timeZone: "Asia/Bangkok",
          day: "2-digit",
          month: "long",
        }

        const orderDateFormatter = new Intl.DateTimeFormat(
          "en-GB",
          orderDateOptions
        )
        const expireDateFormatter = new Intl.DateTimeFormat(
          "en-GB",
          expireDateOptions
        )

        const formattedOrderDate = orderDateFormatter.format(currentDate)
        const formattedExpireDate = expireDateFormatter.format(expireDate)

        if (!batchUpdates[sheetName]) batchUpdates[sheetName] = []
        batchUpdates[sheetName].push({
          row,
          updates: {
            personalKey,
            expireDate: formattedExpireDate,
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

    if (currentBalance < calculatedTotalCost) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          requiredBalance: calculatedTotalCost,
          currentBalance,
        },
        { status: 400 }
      )
    }

    // Perform batch updates
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

    // Update user balance
    const newBalance = currentBalance - calculatedTotalCost
    await updateUserField(
      process.env.___SPREADSHEET_ID as string,
      "UserInfo",
      "A",
      personalKey,
      "B",
      newBalance.toString()
    )

    // await logActivity("Checkout", personalKey, {
    //   items: selectedProducts.map((product) => ({
    //     name: formatProductName(product.name),
    //     quantity: product.quantity,
    //     duration: product.duration,
    //   })),
    //   totalCost: calculatedTotalCost,
    //   currentBalance,
    //   newBalance,
    // })
    const logEntry = {
      type: "Checkout", // Example type
      user: personalKey, // Example user
      details: {
        items: selectedProducts.map((product) => ({
          name: formatProductName(product.name),
          quantity: product.quantity,
          duration: product.duration,
        })),
        totalCost: calculatedTotalCost,
        currentBalance,
        newBalance,
      },
    }
    const mainUrl = process.env.NEXT_PUBLIC_API_URL
    fetch(`${mainUrl}/api/log_activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_LOGGING_API_KEY || "",
      },
      body: JSON.stringify({ logEntry }),
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Failed to log activity")
        } else {
          console.log("Activity logged successfully")
        }
      })
      .catch((error) => {
        console.error("Error logging activity:", error)
      })

    return NextResponse.json({
      message: "Checkout successful",
    })
  } catch (error) {
    console.error("Error during checkout verification:", error)
    return NextResponse.json(
      { error: "Failed to verify checkout" },
      { status: 500 }
    )
  }
}
