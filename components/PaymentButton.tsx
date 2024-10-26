"use client"
import { useState } from "react"
import axios from "axios"
import Image from "next/image"

export default function PaymentButton() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)

    try {
      // Step 1: Create a payment intent
      const paymentIntentResponse = await axios.post(
        "/api/stripe/payment-intent",
        {
          amount: 10000, // Example amount in THB (100.00 THB)
          currency: "thb",
        },
      )

      const { paymentIntentId } = paymentIntentResponse.data

      // Step 2: Get the QR code URL
      const qrCodeResponse = await axios.post("/api/stripe/get-qr", {
        paymentIntentId: paymentIntentId,
      })

      const { qrCodeUrl } = qrCodeResponse.data

      // Step 3: Set the QR code URL to display
      setQrCodeUrl(qrCodeUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      {!qrCodeUrl && (
        <button
          className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Generating QR..." : "Generate Payment QR Code"}
        </button>
      )}

      {qrCodeUrl && (
        <div className='mt-6'>
          <p>Scan the QR code to pay:</p>
          <Image
            src={qrCodeUrl}
            alt='PromptPay QR Code'
            width={300}
            height={300}
            className='mt-4'
          />
        </div>
      )}
    </div>
  )
}
