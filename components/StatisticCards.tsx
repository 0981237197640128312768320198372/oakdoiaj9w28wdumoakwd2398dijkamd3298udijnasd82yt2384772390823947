/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState } from "react"

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
      const response = await fetch("/api/table_statistic")
      if (!response.ok) throw new Error("Failed to fetch statistics")
      const data = await response.json()

      // Flatten any nested objects if necessary
      const flattenedData = Object.keys(data).reduce((acc, key) => {
        acc[key] = typeof data[key] === "object" ? null : data[key] // Handle nested objects gracefully
        return acc
      }, {} as Record<string, number | null>)

      setStatistics(flattenedData)
    } catch (err: any) {
      console.error("Error fetching statistics:", err)
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center'>
        <p>Loading statistics...</p>
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

  // Map to dynamically render statistics
  const statsMapping = [
    {
      label: "Total Products Sold (All Time)",
      key: "totalProductsSoldAllTime",
    },
    {
      label: "Total Deposit (All Time)",
      key: "totalDepositAllTime",
    },
    {
      label: "Total Spent (All Time)",
      key: "totalSpentAllTime",
    },
    { label: "Total Products Sold (Today)", key: "totalProductsSoldToday" },
    {
      label: "Total Deposit (Today)",
      key: "totalDepositToday",
    },
    { label: "Total Spent (Today)", key: "totalSpentToday" },
    { label: "Stock Available", key: "stockAvailable" },
    { label: "Users Login (Today)", key: "usersLoginToday" },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
      {statsMapping.map(({ label, key }) => (
        <div
          key={key}
          className='p-4 bg-dark-700 border border-dark-500 rounded shadow'
        >
          <h3 className='text-sm text-light-800'>{label}</h3>
          <p className='text-lg font-bold text-primary'>
            {statistics[key] !== undefined && statistics[key] !== null
              ? `$${Number(statistics[key]).toLocaleString()}`
              : statistics[key]}
          </p>
        </div>
      ))}
    </div>
  )
}

export default StatisticCards
