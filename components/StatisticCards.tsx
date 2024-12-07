/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState } from "react"
import { AiOutlineProduct } from "react-icons/ai"
import { TbRefresh } from "react-icons/tb"

const StatisticCards = () => {
  const [statistics, setStatistics] = useState<Record<string, number | null>>(
    {}
  )
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/table_statistic", {
        cache: "no-store", // Ensure fresh data on each fetch
      })
      if (!response.ok) throw new Error("Failed to fetch statistics")
      const data = await response.json()
      setStatistics(data) // Update the state with the new data
    } catch (err: any) {
      console.error("Error fetching statistics:", err)
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, []) // Initial data fetch

  const allTimeStats = [
    {
      label: "Total Products Sold",
      key: "totalProductsSoldAllTime",
    },
    {
      label: "Total Deposit",
      key: "totalDepositAllTime",
    },
    {
      label: "Total Spent",
      key: "totalSpentAllTime",
    },
    {
      label: "Stock Available",
      key: "stockAvailable",
    },
  ]

  const todayStats = [
    { label: "Total Products Sold", key: "totalProductsSoldToday" },
    {
      label: "Total Deposit",
      key: "totalDepositToday",
    },
    { label: "Total Spent", key: "totalSpentToday" },
    { label: "Users Login", key: "usersLoginToday" },
  ]

  const renderSkeleton = (count: number) =>
    Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className='p-4 bg-dark-600 border border-dark-500 rounded shadow animate-pulse'
      >
        <div className='h-4 bg-dark-500 rounded mb-2 w-3/4'></div>
        <div className='h-6 bg-dark-500 rounded w-1/2'></div>
      </div>
    ))

  if (loading) {
    return (
      <div className='flex flex-col w-full gap-5 bg-dark-700 p-5 border-[1px] border-dark-500 rounded-md'>
        <div className='flex justify-between items-start'>
          <h3 className='flex items-center gap-2 font-bold mb-5'>
            <AiOutlineProduct />
            Statistic Data
          </h3>
          <button
            disabled
            className='p-1 text-sm rounded-sm h-fit font-aktivGroteskBold w-fit bg-primary text-dark-800 opacity-50 cursor-not-allowed'
            title='Refresh emails'
          >
            <TbRefresh className='text-xl' />
          </button>
        </div>

        <div>
          <h2 className='text-lg font-bold text-light-800 mb-4'>
            All Time Statistics
          </h2>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-5'>
            {renderSkeleton(allTimeStats.length)}
          </div>
        </div>

        <div>
          <h2 className='text-lg font-bold text-light-800 mb-4'>
            Today's Statistics
          </h2>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-5'>
            {renderSkeleton(todayStats.length)}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center'>
        <p className='text-red-500'>Error: {error}</p>
      </div>
    )
  }

  if (!Object.keys(statistics).length) {
    return (
      <div className='flex items-center justify-center'>
        <p>No statistics available</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col w-full gap-5 bg-dark-700 p-5 border-[1px] border-dark-500 rounded-md'>
      <div className='flex justify-between items-start'>
        <h3 className='flex items-center gap-2 font-bold mb-5'>
          <AiOutlineProduct />
          Statistic Data
        </h3>
        <button
          onClick={fetchStatistics}
          disabled={loading}
          className='p-1 text-sm rounded-sm h-fit font-aktivGroteskBold w-fit bg-primary text-dark-800 hover:bg-primary/70 hover:text-dark-800'
          title='Refresh emails'
        >
          <TbRefresh className='text-xl' />
        </button>
      </div>
      <div>
        <h2 className='text-lg font-bold text-light-800 mb-4'>
          Today's Statistics
        </h2>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-5'>
          {todayStats.map(({ label, key }) => (
            <div
              key={key}
              className='p-4 bg-dark-600 border border-dark-500 rounded shadow'
            >
              <h3 className='text-sm text-light-800'>{label}</h3>
              <p className='text-lg font-bold text-primary'>
                {statistics[key] !== undefined && statistics[key] !== null
                  ? Number(statistics[key]).toLocaleString() // Format number
                  : "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className='text-lg font-bold text-light-800 mb-4'>
          All Time Statistics
        </h2>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-5'>
          {allTimeStats.map(({ label, key }) => (
            <div
              key={key}
              className='p-4 bg-dark-600 border border-dark-500 rounded shadow'
            >
              <h3 className='text-sm text-light-800'>{label}</h3>
              <p className='text-lg font-bold text-primary'>
                {statistics[key] !== undefined && statistics[key] !== null
                  ? Number(statistics[key]).toLocaleString() // Format number
                  : "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatisticCards
