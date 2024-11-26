/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import Loading from "./Loading"
import { IoBagCheckOutline } from "react-icons/io5"
import { SlWallet } from "react-icons/sl"
import { BiLogOutCircle, BiLogInCircle } from "react-icons/bi"
import dokmaicoin from "@/assets/images/dokmaicoin.png"
import netflixpremium from "@/assets/images/netflixpremiumuhd.png"
import primevideo from "@/assets/images/amazonprimevideo.png"
import Image from "next/image"

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [filter, setFilter] = useState<string>("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<number>(30000)

  const fetchLogs = async () => {
    try {
      console.log("Fetching logs...")
      const response = await fetch("/api/get_logs")
      if (!response.ok) throw new Error("Failed to fetch logs")

      const data = await response.json()
      console.log("Fetched logs from API:", data)

      const sortedLogs = Array.isArray(data.logs)
        ? data.logs.sort(
            (a: any, b: any) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        : []

      setLogs(sortedLogs)
      setFilteredLogs(
        filter === "All"
          ? sortedLogs
          : sortedLogs.filter((log: any) => log.activity.type === filter)
      )
      setError(null)
    } catch (error) {
      console.error("Error fetching logs:", error)
      setError("Failed to fetch logs. Please try again later.")
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch logs on mount and set up periodic refresh
  useEffect(() => {
    fetchLogs()

    const interval = setInterval(() => {
      console.log("Auto-refreshing logs...")
      fetchLogs()
    }, refreshInterval)

    return () => clearInterval(interval) // Cleanup interval on unmount
  }, [refreshInterval])

  useEffect(() => {
    setFilteredLogs(
      filter === "All"
        ? logs
        : logs.filter((log) => log.activity.type === filter)
    )
  }, [filter, logs])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className='flex justify-center items-center'>
        <p className='px-2 py-1 bg-red-600/20 rounded border-[1px] border-red-500/70 text-red-500 w-fit'>
          {error}
        </p>
      </div>
    )
  }
  console.log("Filtered Logs:", filteredLogs)
  return (
    <div className='p-5 border-[1px] border-dark-500 '>
      <h1 className='text-2xl font-bold mb-5'>Activity Logs</h1>
      <div className='flex gap-3 mb-5 px-5'>
        {["All", "Login", "Logout", "Checkout", "Deposit"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-2 ${
              filter === type
                ? "text-primary pb-1 border-b-[1px] border-primary"
                : "text-light-400 "
            }`}
          >
            {type}
          </button>
        ))}
        {/* Manual Refresh Button */}
        <button
          onClick={fetchLogs}
          className='px-2 bg-primary text-dark-800 font-aktivGroteskBold rounded hover:bg-primary/80'
        >
          Refresh
        </button>
      </div>

      {filteredLogs.length > 0 ? (
        <div className='flex flex-col overflow-y-scroll max-h-96 gap-5 w-full px-5'>
          {filteredLogs.map((log, index) => (
            <div
              key={index}
              className='flex flex-col border border-dark-400 shadow-md p-5 rounded bg-dark-700 hover:shadow-lg transition duration-200'
            >
              <div className='flex w-full justify-between items-start mb-5 border-b-[1px] border-dark-500 pb-3'>
                <div className='font-aktivGroteskMedium flex items-center gap-2'>
                  {log.activity.type === "Checkout" && (
                    <IoBagCheckOutline className='text-xl' />
                  )}
                  {log.activity.type === "Login" && (
                    <BiLogInCircle className='text-xl' />
                  )}
                  {log.activity.type === "Logout" && (
                    <BiLogOutCircle className='text-xl' />
                  )}
                  {log.activity.type === "Deposit" && (
                    <SlWallet className='text-xl' />
                  )}
                  <span>
                    <p className='select-none font-aktivGroteskBold'>
                      {log.activity.type}
                    </p>
                  </span>
                </div>
                <div className='text-xs text-end text-light-100'>
                  {log.timestamp}
                  <p className='select-none font-aktivGroteskLight text-xs'>
                    {log.activity.user}
                  </p>
                </div>
              </div>
              {Array.isArray(log.activity.details.items) && (
                <div className='flex flex-col gap-3'>
                  {/* Items Rendering */}
                  {Array.isArray(log.activity.details.items) &&
                    log.activity.details.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className='flex justify-between items-center border-b border-dark-600 py-3 gap-14'
                      >
                        <div className='w-full flex gap-3 items-center'>
                          <Image
                            src={
                              item.name.includes("Netflix")
                                ? netflixpremium
                                : primevideo
                            }
                            alt={`${item.name} image`}
                            width={60}
                            height={60}
                            className='select-none'
                            loading='lazy'
                          />
                          <div className='flex flex-col'>
                            <p className='text-xs font-thin'>{item.name}</p>
                            <div className='flex gap-1 items-center'>
                              <span
                                className={`px-1 text-sm mr-3 ${
                                  item.name.includes("Reseller")
                                    ? "bg-goldVIP"
                                    : "bg-primary"
                                } text-dark-800 font-aktivGroteskBold whitespace-nowrap`}
                              >
                                {item.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-3 text-xs px-2 py-1 rounded bg-dark-700 border-[1px] border-dark-500'>
                          x{item.quantity}
                        </div>
                      </div>
                    ))}
                  {/* Balances */}
                  {(log.activity.details.currentBalance ||
                    log.activity.details.totalCost ||
                    log.activity.details.newBalance) && (
                    <div>
                      {log.activity.details.currentBalance && (
                        <div className='flex items-center'>
                          <p className='text-xs mr-3'>Current Balance</p>
                          <Image
                            src={dokmaicoin}
                            width={300}
                            height={300}
                            className='w-5 h-5'
                            alt='Dokmai Coin Icon'
                          />
                          <p className='text-xs flex'>
                            {log.activity.details.currentBalance}
                          </p>
                        </div>
                      )}
                      {log.activity.details.totalCost && (
                        <div className='flex items-center'>
                          <p className='text-xs mr-3'>Total Cost</p>
                          <Image
                            src={dokmaicoin}
                            width={300}
                            height={300}
                            className='w-5 h-5'
                            alt='Dokmai Coin Icon'
                          />
                          <p className='text-xs flex'>
                            {log.activity.details.totalCost}
                          </p>
                        </div>
                      )}
                      {log.activity.details.newBalance && (
                        <div className='flex items-center'>
                          <p className='text-xs mr-3'>New Balance</p>
                          <Image
                            src={dokmaicoin}
                            width={300}
                            height={300}
                            className='w-5 h-5'
                            alt='Dokmai Coin Icon'
                          />
                          <p className='text-xs flex'>
                            {log.activity.details.newBalance}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {log.activity.details && log.activity.details.description && (
                <div className='flex w-full items-center justify-center'>
                  <p
                    className={`px-2 py-1 rounded border-[1px] w-full text-center 
                    ${
                      log.activity.type === "Login" &&
                      "bg-green-600/20 border-green-500/70 text-green-500 "
                    }
                    ${
                      log.activity.type === "Logout" &&
                      "bg-red-600/20 border-red-500/70 text-red-500 "
                    }
                      `}
                  >
                    {log.activity.details.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className='px-2 py-1 bg-red-600/20 rounded border-[1px] border-red-500/70 text-red-500 w-fit'>
          No activity logs available for the selected filter.
        </p>
      )}
    </div>
  )
}
