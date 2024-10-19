// import { NextResponse } from "next/server"
// import Stripe from "stripe"

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-09-30.acacia",
// })

// export async function GET() {
//   try {
//     // List available payment methods for the account
//     const paymentMethods = await stripe.paymentMethods.list({
//       type: "card", // Try 'promptpay' here as well, or just 'card' for initial check
//     })

//     return NextResponse.json(paymentMethods)
//   } catch (error) {
//     console.error("Error fetching payment methods:", error)
//     return NextResponse.json({ error: error }, { status: 500 })
//   }
// }
