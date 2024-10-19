// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextRequest, NextResponse } from "next/server"
// import Stripe from "stripe"

// // Initialize Stripe with your secret key
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-09-30.acacia",
// })

// export async function POST(req: NextRequest) {
//   try {
//     const { paymentIntentId } = await req.json()

//     // Retrieve the confirmed payment intent to get the payment details
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

//     // Log the entire payment intent to inspect its structure
//     console.log("PaymentIntent:", JSON.stringify(paymentIntent, null, 2))

//     // Check if the paymentIntent has next_action for PromptPay QR code
//     if (paymentIntent.next_action?.type === "promptpay_display_qr_code") {
//       // Extract the QR code URL
//       const qrCodeUrl = (paymentIntent.next_action as any)
//         ?.promptpay_display_qr_code?.qr_code_url

//       if (!qrCodeUrl) {
//         throw new Error("QR code URL not found")
//       }

//       // Return the QR code URL to the frontend
//       return NextResponse.json({ qrCodeUrl })
//     } else {
//       throw new Error("PromptPay QR code action not found")
//     }
//   } catch (error) {
//     console.error("Error retrieving QR code:", error)
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : "Unknown error" },
//       { status: 500 }
//     )
//   }
// }
