/* eslint-disable react-hooks/exhaustive-deps */
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
import { LuActivity } from "react-icons/lu"

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [filter, setFilter] = useState<string>("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<number>(300000)

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

    return () => clearInterval(interval)
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
      <div className='flex justify-center items-center w-full h-full'>
        <p className='px-2 py-1 bg-red-600/20 rounded border-[1px] border-red-500/70 text-red-500 w-fit'>
          {error}
        </p>
      </div>
    )
  }
  return (
    <div className='p-5 border-[1px] border-dark-500 w-full md:min-w-[500px] md:w-fit'>
      <div className='w-full flex justify-between'>
        <h3 className='flex items-center gap-2 font-bold mb-5'>
          <LuActivity />
          Activity
        </h3>
        <button
          onClick={fetchLogs}
          className='px-2 h-fit rounded bg-primary/20 text-primary  hover:bg-primary/30 active:bg-primary/40'
        >
          Refresh
        </button>
      </div>

      <div className='flex gap-3 mb-5 px-5 w-full justify-center'>
        {["All", "Login", "Logout", "Checkout", "Deposit"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-1 text-xs ${
              filter === type
                ? "text-primary pb-1 border-b-[1px] border-primary"
                : "text-light-400 "
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {filteredLogs.length > 0 ? (
        <div className='flex flex-col overflow-y-scroll max-h-96 gap-5 w-full px-5'>
          {filteredLogs.map((log, index) => (
            <div
              key={index}
              className='flex flex-col border border-dark-400 shadow-md p-5 rounded bg-dark-700 hover:shadow-lg transition duration-200'
            >
              <div className='flex w-full justify-between items-start mb-5 border-b-[1px] border-dark-500 pb-3'>
                <div className='font-aktivGroteskMedium flex items-center gap-2 bg-light-100/20 border-light-100/70 text-light-100 px-1 rounded'>
                  {log.activity.type === "Checkout" && <IoBagCheckOutline />}
                  {log.activity.type === "Login" && <BiLogInCircle />}
                  {log.activity.type === "Logout" && <BiLogOutCircle />}
                  {log.activity.type === "Deposit" && <SlWallet />}
                  <span>
                    <p className='select-none text-sm '>{log.activity.type}</p>
                  </span>
                </div>
                <div className='text-xs text-end text-light-100'>
                  {log.timestamp}
                  <p className='select-none font-aktivGroteskLight text-xs'>
                    {log.activity.user}
                  </p>
                </div>
              </div>
              {log.activity.type === "Checkout" &&
                Array.isArray(log.activity.details.items) && (
                  <div className='flex flex-col gap-3'>
                    {/* Items Rendering */}
                    {Array.isArray(log.activity.details.items) &&
                      log.activity.details.items.map(
                        (item: any, idx: number) => (
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
                        )
                      )}
                    {/* Balances */}
                    {(log.activity.details.currentBalance ||
                      log.activity.details.totalCost ||
                      log.activity.details.newBalance) && (
                      <div className='flex justify-between'>
                        {log.activity.details.currentBalance && (
                          <div className='flex items-start flex-col px-2 border-s-[1px] border-dark-400'>
                            <p className='text-xs mr-1'>Previous Balance</p>
                            <span className='flex items-center'>
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
                            </span>
                          </div>
                        )}
                        {log.activity.details.totalCost && (
                          <div className='flex items-start flex-col px-2 border-s-[1px] border-dark-400'>
                            <p className='text-xs mr-1'>Total Cost</p>
                            <span className='flex items-center'>
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
                            </span>
                          </div>
                        )}
                        {log.activity.details.newBalance && (
                          <div className='flex items-start flex-col px-2 border-s-[1px] border-dark-400'>
                            <p className='text-xs mr-1'>Current Balance</p>
                            <span className='flex items-center'>
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
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              {(log.activity.type === "Login" || "Logout") &&
                log.activity.details.description && (
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
              {log.activity.type === "Deposit" &&
                (log.activity.details.amount ||
                  log.activity.details.newBalance) && (
                  <div className='flex justify-center gap-5'>
                    {log.activity.details.amount && (
                      <div className='flex items-start flex-col px-2 border-s-[1px] border-dark-400'>
                        <p className='text-xs mr-1'>Deposit</p>
                        <span className='flex items-center'>
                          <Image
                            src={dokmaicoin}
                            width={300}
                            height={300}
                            className='w-5 h-5'
                            alt='Dokmai Coin Icon'
                          />
                          <p className='text-xs flex'>
                            {log.activity.details.amount}
                          </p>
                        </span>
                      </div>
                    )}
                    {log.activity.details.newBalance && (
                      <div className='flex items-start flex-col px-2 border-s-[1px] border-dark-400'>
                        <p className='text-xs mr-1'>Current Balance</p>
                        <span className='flex items-center'>
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
                        </span>
                      </div>
                    )}
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
