/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useState, useRef } from "react"
import { GoChevronRight } from "react-icons/go"

interface MergedEntry {
  id: string
  showId: string
  category: string
  rank: number
  showName: string
  seasonName: string
  horizontal: string
  vertical: string
}

interface CarouselProps {
  items: MergedEntry[]
  scrollSpeed: number
  isLoading: boolean // Add isLoading prop to control skeleton display
}

const HorizontalAutoScrollCarousel: React.FC<CarouselProps> = ({
  items,
  scrollSpeed,
  isLoading,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isLoading) return

    const container = containerRef.current
    if (!container) return

    // Auto-scroll function
    const autoScroll = () => {
      if (
        !isHovered &&
        container.scrollLeft + container.clientWidth < container.scrollWidth
      ) {
        container.scrollLeft += 1 // Adjust speed by changing the increment value
      } else if (
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth
      ) {
        container.scrollLeft = 0 // Reset to start when reaching the end
      }
    }

    const scrollInterval = setInterval(autoScroll, scrollSpeed)

    // Cleanup on component unmount
    return () => clearInterval(scrollInterval)
  }, [isHovered, scrollSpeed, isLoading])

  if (isLoading) {
    return (
      <div className='relative w-full h-full overflow-x-scroll scrollbar-hide whitespace-nowrap __noscrollbar'>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className='inline-block w-[400px] h-[300px] mr-6 flex-shrink-0 bg-dark-400 rounded-lg animate-pulse'
          >
            <div className='absolute bottom-0 left-0 right-0 z-10 p-2 bg-gradient-to-t from-black to-transparent flex'>
              <div className='ml-2 flex flex-col justify-center'>
                <div className='h-4 w-3/4 bg-dark-300 rounded-md mb-2'></div>
                <div className='h-4 w-1/2 bg-dark-300 rounded-md'></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className='relative w-full h-full overflow-x-scroll scrollbar-hide whitespace-nowrap __noscrollbar'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className='relative inline-block max-w-[500px] mr-6 flex-shrink-0 overflow-hidden rounded-lg shadow-lg'
        >
          <Image
            src={item.horizontal}
            alt={`${item.showName} Netflix Box Art`}
            className='w-full h-full object-cover'
            width={700}
            height={700}
          />

          {/* Content */}
          <div className='absolute bottom-0 left-0 right-0 z-10 p-2 bg-gradient-to-t from-black to-transparent flex'>
            <Image
              src={`https://www.netflix.com/tudum/top10/images/big_numbers/${item.rank}.png`}
              alt='Rank Icon'
              width={50}
              height={50}
              className='h-full '
            />
            <div>
              <h3 className='text-lg font-semibold text-white'>
                {item.showName}
              </h3>
              <Link
                href={`https://netflix.com/watch/${item.showId}`}
                className='bg-primary py-1 px-2 text-dark-800 text-xs font-aktivGroteskBold w-fit rounded-sm flex items-center justify-center'
                target='_blank'
              >
                Watch Now
                <GoChevronRight className='text-lg' />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NetflixTop10() {
  const [data, setData] = useState<MergedEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/get_netflix_top10")
        if (!response.ok) throw new Error("Failed to fetch data")
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError("Error fetching data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (error)
    return (
      <div className='px-2 pt-1 bg-red-600/20 rounded border-[1px] border-red-500/70 text-red-500'>
        {error}
      </div>
    )

  const tvItems = data
    .filter((item) => item.category === "tv")
    .sort((a, b) => a.rank - b.rank)
  const filmsItems = data
    .filter((item) => item.category === "films")
    .sort((a, b) => a.rank - b.rank)

  return (
    <div className='container mx-auto p-4'>
      <section>
        <h2 className='text-xl font-semibold mb-4'>Top TV Shows</h2>
        <HorizontalAutoScrollCarousel
          items={tvItems}
          scrollSpeed={20}
          isLoading={isLoading}
        />
      </section>

      <section className='mt-8'>
        <h2 className='text-xl font-semibold mb-4'>Top Films</h2>
        <HorizontalAutoScrollCarousel
          items={filmsItems}
          scrollSpeed={50}
          isLoading={isLoading}
        />
      </section>
    </div>
  )
}
