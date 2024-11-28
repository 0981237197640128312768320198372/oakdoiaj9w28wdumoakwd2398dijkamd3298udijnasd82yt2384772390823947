"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, ReactNode } from "react"
import LoadingAnimation from "@/components/Loading"

interface HomeWrapperProps {
  children: ReactNode
}

export const HomeWrapper: React.FC<HomeWrapperProps> = ({ children }) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulating a loading delay or data fetching
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000) // Adjust the duration as needed

    return () => clearTimeout(timer) // Cleanup the timer on unmount
  }, [])

  if (loading) {
    return <LoadingAnimation />
  }

  return <>{children}</>
}
