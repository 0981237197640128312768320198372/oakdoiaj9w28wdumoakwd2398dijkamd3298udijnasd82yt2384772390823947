import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
})
export async function POST(req: NextRequest) {
  try {
    const { amount, currency } = await req.json()

    // Create the payment intent with PromptPay as the payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in the smallest currency unit, e.g., 10000 = 100.00 THB
      currency: currency, // Example: "thb" (Thai Baht) for PromptPay
      payment_method_types: ["promptpay"],
    })

    // Confirm the payment intent to trigger next_action for QR code
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      {
        payment_method: "promptpay", // Explicitly set promptpay as the method
      }
    )

    // Return the client secret and payment intent ID for the frontend to use
    return NextResponse.json({
      clientSecret: confirmedPaymentIntent.client_secret,
      paymentIntentId: confirmedPaymentIntent.id,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    )
  }
}
