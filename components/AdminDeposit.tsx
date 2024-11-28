/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { logActivity } from "@/lib/utils"
import { useState } from "react"
import { SlWallet } from "react-icons/sl"

const AdminDeposit = () => {
  const [personalKey, setPersonalKey] = useState("")
  const [depositAmount, setDepositAmount] = useState<number | "">("")
  const [bonusPercentage, setBonusPercentage] = useState<number>(0) // New state for bonus percentage
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      // Calculate the total deposit amount with bonus
      const bonusAmount = (Number(depositAmount) * bonusPercentage) / 100
      const totalDepositAmount = Number(depositAmount) + bonusAmount

      const response = await fetch("/api/deposit_balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalKey,
          depositAmount: totalDepositAmount,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to deposit balance")
      }

      const data = await response.json()
      setSuccessMessage(
        `${data.message} New Balance ${personalKey}: ${data.newBalance}`
      )
      await logActivity("Deposit", personalKey, {
        amount: totalDepositAmount,
        newBalance: data.newBalance,
        bonusPercentage,
      })
      setPersonalKey("")
      setDepositAmount("")
      setBonusPercentage(0) // Reset bonus percentage
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full border-[1px] border-dark-500 p-5 rounded bg-dark-700'>
      <h3 className='flex items-center gap-2 font-bold mb-5'>
        <SlWallet />
        Deposit
      </h3>
      <form onSubmit={handleDeposit} className='flex flex-col gap-5'>
        <input
          type='text'
          placeholder='Personal Key'
          value={personalKey}
          onChange={(e) => setPersonalKey(e.target.value)}
          required
          className='p-2 border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary'
        />
        <div className='flex gap-5 items-center'>
          <input
            type='number'
            placeholder='Deposit Amount'
            value={depositAmount}
            onChange={(e) => setDepositAmount(Number(e.target.value) || "")}
            required
            className='p-2 border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary w-4/6'
          />
          <input
            type='number'
            placeholder='Bonus Percentage (default 0%)'
            value={bonusPercentage}
            onChange={(e) =>
              setBonusPercentage(
                Math.max(0, Math.min(Number(e.target.value), 100))
              )
            } // Restrict percentage between 0 and 100
            className='p-2 border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary w-2/6'
          />
          %
        </div>

        <button
          type='submit'
          disabled={loading}
          className={`bg-primary text-dark-800 py-2 font-aktivGroteskBold ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/80"
          }`}
        >
          {loading ? "Processing..." : "Deposit Balance"}
        </button>
      </form>

      {successMessage && (
        <p className='mt-4 text-green-500 bg-green-500/10 p-2 border border-green-500'>
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className='mt-4 text-red-500 bg-red-500/10 p-2 border border-red-500'>
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export default AdminDeposit
