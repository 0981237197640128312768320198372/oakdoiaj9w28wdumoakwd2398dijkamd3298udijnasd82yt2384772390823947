/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getGoogleSheetsData, manageProductData } from "@/app/api/CRUD"
import process from "process"

type SelectedProduct = {
  name: string
  quantity: number
  duration: string
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
        { status: 400 },
      )
    }

    const userInfo =
      (await getGoogleSheetsData(
        process.env.___SPREADSHEET_ID as string,
        "UserInfo!A2:D",
      )) || []

    const user = userInfo.find((row: any[]) => row[0] === personalKey)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userBalance = parseFloat(user[1])
    const userContact = user[3]

    const productData = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/get_products`,
    )
      .then((res) => res.json())
      .catch((error) => {
        console.error("Error fetching product data:", error)
        return null
      })

    if (!productData) {
      return NextResponse.json(
        { error: "Failed to retrieve product data" },
        { status: 500 },
      )
    }

    let calculatedTotalCost = 0
    const unavailableProducts: string[] = []
    const purchasedProductsData = []

    for (const selectedProduct of selectedProducts) {
      const { name, quantity, duration } = selectedProduct
      const product = productData.find((p: any) => p.name === name)

      if (!product || product.stock < quantity) {
        unavailableProducts.push(name)
        continue
      }

      const productPrice = parseFloat(product.details[0].price)
      calculatedTotalCost += productPrice * quantity
      purchasedProductsData.push({ product, quantity, duration })
    }

    if (unavailableProducts.length > 0) {
      return NextResponse.json(
        { error: "Some products are out of stock", unavailableProducts },
        { status: 400 },
      )
    }

    if (userBalance < calculatedTotalCost) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          requiredBalance: calculatedTotalCost,
          currentBalance: userBalance,
        },
        { status: 400 },
      )
    }

    const currentDate = new Date()
    const formattedOrderDate = `${String(currentDate.getDate()).padStart(
      2,
      "0",
    )} ${currentDate.toLocaleString("default", {
      month: "long",
    })} ${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(
      2,
      "0",
    )}:${String(currentDate.getMinutes()).padStart(2, "0")}`

    const batchUpdates: Record<
      string,
      {
        row: number
        updates: {
          personalKey: string
          expireDate: string
          orderDate: string
          contact: string
        }
        expireDateColumnIndex: number
      }[]
    > = {}

    for (const { product, quantity, duration } of purchasedProductsData) {
      if (!product.availableDataRange) {
        console.warn(
          `No availableDataRange defined for product: ${product.name}`,
        )
        continue
      }

      const expireDateColumnIndex = product.expireDateColumnIndex
      const sheetName = product.availableDataRange.split("!")[0]

      if (!sheetName) {
        console.error(`Invalid sheet name for product: ${product.name}`)
        continue
      }

      for (let i = 0; i < quantity; i++) {
        const availableAccount = product.availableAccounts.shift()

        if (!availableAccount || availableAccount.data[0] !== "") {
          console.warn("No valid available account found for the product.")
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
        const formattedExpireDate = expireDate.toISOString().split("T")[0]

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

    const updatePromises = Object.entries(batchUpdates).map(
      async ([sheetName, updates]) => {
        const updateOperations = updates.map(
          ({ row, updates, expireDateColumnIndex }) =>
            manageProductData(
              process.env.___SPREADSHEET_ID as string,
              sheetName,
              row,
              updates,
              expireDateColumnIndex,
            ),
        )
        return Promise.all(updateOperations)
      },
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      message: "Checkout successful",
      userContact,
      totalCost: calculatedTotalCost,
    })
  } catch (error) {
    console.error("Error during checkout verification:", error)
    return NextResponse.json(
      { error: "Failed to verify checkout" },
      { status: 500 },
    )
  }
}
