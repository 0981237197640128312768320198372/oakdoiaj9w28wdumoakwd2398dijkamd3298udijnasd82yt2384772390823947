"use client"

import { Timeline } from "@/components/Timeline"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface HelpStep {
  step: string
  description: string
  picture: string
}

interface HelpItem {
  id: string
  title: string
  description: string
  categories: string[]
  steps: HelpStep[]
}

const ShowHelpList = () => {
  const [helps, setHelps] = useState<HelpItem[]>([])
  const [filteredHelps, setFilteredHelps] = useState<HelpItem[]>([])
  const [selectedHelp, setSelectedHelp] = useState<HelpItem | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const animationVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  }

  const fetchHelps = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/get_helps?fetchall=true")
      if (!response.ok) {
        throw new Error("Failed to fetch helps.json")
      }

      const data = await response.json()
      setHelps(data.helps)
      setFilteredHelps(data.helps) // Initially, filteredHelps contains all helps
    } catch (error) {
      console.error("Error fetching helps:", error)
      setError("Failed to load help data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    const filtered = helps.filter((help) => {
      const { title, description, steps } = help

      return (
        title.toLowerCase().includes(term) ||
        description.toLowerCase().includes(term) ||
        steps.some(
          (step) =>
            step.step.toLowerCase().includes(term) ||
            step.description.toLowerCase().includes(term)
        )
      )
    })

    setFilteredHelps(filtered)
  }

  useEffect(() => {
    fetchHelps()
  }, [])

  return (
    <div className='w-full px-5 xl:px-0 mt-10 mb-50 __container'>
      {error && <p className='text-red-500'>{error}</p>}

      {/* Search Bar */}
      <div className='mb-5'>
        <input
          type='text'
          placeholder='Search helps...'
          value={searchTerm}
          onChange={handleSearch}
          className='border-[1px] border-primary/40 p-2 px-3 w-full hover:border-primary focus:border-primary focus:outline-none focus:ring-0 bg-transparent text-sm'
        />
      </div>

      {/* Helps List or Skeleton */}
      <div className='__container bg-dark-700 flex gap-5 p-5 overflow-x-auto w-full __dokmai_scrollbar'>
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className='p-5 bg-dark-600 text-light-100 rounded shadow min-w-96 w-96 animate-pulse'
              >
                <div className='h-6 bg-dark-500 rounded w-3/4 mb-2'></div>
                <div className='h-4 bg-dark-500 rounded w-full mb-4'></div>
                <div className='flex justify-end'>
                  <div className='h-4 bg-dark-500 rounded w-1/4'></div>
                  <div className='h-4 bg-dark-500 rounded w-1/4'></div>
                  <div className='h-4 bg-dark-500 rounded w-1/4'></div>
                </div>
              </div>
            ))
          : filteredHelps.length > 0
          ? filteredHelps.map((help) => (
              <div
                key={help.id}
                className='p-5 bg-dark-600 text-light-100 rounded shadow hover:bg-dark-800 cursor-pointer w-96'
                onClick={() => setSelectedHelp(help)}
              >
                <h2 className='text-lg font-aktivGroteskBold truncate'>
                  {help.title}
                </h2>
                <p className='text-xs text-light-800 font-aktivGroteskLight truncate'>
                  {help.description}
                </p>
                <div className='mt-2 flex w-full justify-end items-end'>
                  {help.categories.map((category) => (
                    <span
                      key={category}
                      className='bg-dark-500 text-gray-400 text-xs px-2 py-1 rounded mr-1'
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            ))
          : "Help Center In Progress"}
      </div>

      {selectedHelp && (
        <motion.div
          key={selectedHelp.id}
          className='bg-dark-700 p-5 rounded shadow w-full mt-10 pb-20'
          initial='hidden'
          animate='visible'
          exit='exit'
          variants={animationVariants}
          transition={{ duration: 0.3 }}
        >
          <h2 className='text-xl font-bold'>{selectedHelp.title}</h2>
          <p className='text-sm mb-3'>{selectedHelp.description}</p>
          <Timeline
            data={selectedHelp.steps.map((step) => ({
              step: step.step,
              content: (
                <div>
                  <p className='text-light-600 text-xs md:text-sm mb-8'>
                    {step.description}
                  </p>
                  <div className='flex w-full h-full gap-4'>
                    <Image
                      loading='lazy'
                      src={step.picture}
                      alt={step.step}
                      width={300}
                      height={300}
                      className='rounded-lg h-[500px] w-auto'
                    />
                  </div>
                </div>
              ),
            }))}
          />
        </motion.div>
      )}
    </div>
  )
}

export default ShowHelpList
