/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { logActivity } from "@/lib/utils"
import { ReactNode, useState } from "react"
import { SlWallet } from "react-icons/sl"
import { updateStatistic } from "@/lib/utils"

const AdminDeposit = () => {
  const [personalKey, setPersonalKey] = useState("")
  const [depositAmount, setDepositAmount] = useState<number | "">("")
  const [bonusPercentage, setBonusPercentage] = useState<number | string>(0)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<ReactNode | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const bonusPercentageNumber = Number(bonusPercentage) || 0

      const bonusAmount = (Number(depositAmount) * bonusPercentageNumber) / 100
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
      await updateStatistic("depositAmount", Number(depositAmount))
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to deposit balance")
      }

      const data = await response.json()

      setSuccessMessage(
        <>
          <p className='font-aktivGroteskBold text-primary'>{data.message}</p>
          <p className='font-aktivGroteskBold text-primary'>{personalKey}</p>
          <p className='font-light text-light-500'>Deposit: {depositAmount}</p>
          <p className='font-light text-light-500'>Bonus: {bonusAmount}</p>
          <p className='font-light text-light-500'>
            Total deposit: {totalDepositAmount}
          </p>
          <p className='font-light text-light-500'>
            Balance: {data.newBalance}
          </p>
        </>
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
      <h3 className='flex gap-2 font-aktivGroteskBold mb-5 border-b-[1px] border-dark-500 pb-3'>
        <SlWallet />
        Deposit
      </h3>
      <form onSubmit={handleDeposit} className='flex flex-col gap-5'>
        <input
          type='text'
          placeholder='Personal Key'
          value={personalKey.toUpperCase()}
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
            className='p-2 border border-primary/70 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary w-3/4'
          />
          <div className='flex items-center border border-primary/70 focus:outline-none focus:ring-1 focus:ring-primary w-1/4'>
            <input
              type='number'
              placeholder='Bonus'
              value={bonusPercentage}
              onChange={(e) => {
                const value = e.target.value

                // Allow empty input
                if (value === "") {
                  setBonusPercentage("")
                } else {
                  // Enforce numeric input and clamp within 0-100
                  const numericValue = Math.max(0, Math.min(Number(value), 100))
                  setBonusPercentage(numericValue)
                }
              }}
              className='p-2 bg-transparent w-full focus:outline-none focus:ring-0 '
            />
            <p className='mr-2'>%</p>
          </div>
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
        <div className='fixed inset-0 h-screen w-screen bg-dark-800/80 backdrop-blur top-0 right-0 z-40 flex flex-col justify-center items-center rounded shadow'>
          <div className='w-fit p-5 bg-dark-700 border-[1px] border-dark-600 rounded-sm'>
            <div className='flex flex-col w-full'>
              {successMessage}
              <button
                onClick={() => {
                  setSuccessMessage(null)
                }}
                className='self-end bg-red-500 font-aktivGroteskBold hover:bg-red-500/90 active:bg-red-500/80 py-1 px-2 text-dark-800'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className='fixed bg-dark-800 top-20 xl:top-40 right-5 xl:right-10 px-4 py-2 rounded shadow'>
          <p className='mt-4 text-red-500 bg-red-500/10 p-2 border border-red-500'>
            {errorMessage}
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminDeposit
