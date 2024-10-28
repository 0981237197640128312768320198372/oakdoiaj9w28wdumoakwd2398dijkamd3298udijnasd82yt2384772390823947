/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import dokmailogosquare from "@/assets/images/dokmailogosquare.png"
import { GoChevronLeft, GoChevronRight } from "react-icons/go"
import { convertGoogleDriveUrl } from "@/lib/utils"

const fetchTotalItems = async () => {
  const res = await fetch(
    `/api/get_paginated_data?sheet=CreditsOrTestimonials&range=A2:C`,
    {
      headers: {
        "x-api-key": "1092461893164193047348723920781631",
      },
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch data")
  }

  const rawData = await res.json()
  return rawData.data.length
}

const fetchCredits = async (page: number, limit: number) => {
  const offset = (page - 1) * limit
  const res = await fetch(
    `/api/get_paginated_data?sheet=CreditsOrTestimonials&range=A2:C&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "x-api-key": "1092461893164193047348723920781631",
      },
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch data")
  }

  const rawCreditsData = await res.json()

  // Transform the raw data into a structured object and reverse it
  const creditsData = rawCreditsData.data
    .map((creditsRow: string[]) => ({
      creditsimageUrl: convertGoogleDriveUrl(creditsRow[0]),
      item: creditsRow[1],
      date: creditsRow[2],
    }))
    .reverse()

  return creditsData
}

export default function PaginatedCredits() {
  const [data, setData] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(3)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTotal = async () => {
      const totalItems = await fetchTotalItems()
      setTotalPages(Math.ceil(totalItems / limit))
    }

    fetchTotal()
  }, [limit])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const credits = await fetchCredits(page, limit)
        setData(credits)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [page, limit])

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const SkeletonLoader = () => {
    return (
      <div className='relative flex flex-col items-center h-full w-screen md:min-w-[350px] max-w-full min-h-[800px] max-h-full justify-center select-none p-3 border-[1px] border-dark-500 rounded-lg animate-pulse'>
        <div className='w-full min-h-[800px] max-h-full bg-dark-400 rounded-md'>
          <div className='relative flex items-center justify-center h-full'>
            <div className='w-10 h-10 border-2 border-b-transparent border-primary rounded-full animate-spin'></div>
            <Image
              src={dokmailogosquare}
              alt='Loading Logo | Dokmai Store'
              width={25}
              height={25}
              loading='lazy'
              className='absolute'
            />
          </div>
        </div>
        <span className='flex flex-col w-full h-full justify-start gap-0 mt-3'>
          <div className='h-6 bg-dark-400 rounded w-3/4 mt-2'></div>
          <div className='h-4 bg-dark-400 rounded w-1/2 mt-1'></div>
        </span>
      </div>
    )
  }

  return (
    <div className='flex flex-col justify-center w-full h-full items-center px-5 lg:px-0'>
      <div className='w-fit h-full grid md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10'>
        {loading
          ? Array.from({ length: limit }).map((_, index) => (
              <>
                <SkeletonLoader key={index} />
              </>
            ))
          : data
              .slice()
              .reverse()
              .map((credit, index: number) => (
                <div
                  key={index}
                  className='relative flex flex-col items-center h-full w-full justify-center select-none p-3 border-[1px] border-dark-500 rounded-lg'
                >
                  <Image
                    src={credit.creditsimageUrl}
                    alt={`Credits Or Testimonial Of ${credit.item} | Dokmai Store`}
                    placeholder='blur'
                    blurDataURL='@/assets/images/blurCredits.jpg'
                    width={350}
                    height={350}
                    className='rounded-md overflow-hidden select-none w-auto h-auto'
                    loading='lazy'
                  />
                  <span className='flex flex-col w-full justify-start gap-0 mt-3'>
                    <p className='flex justify-start font-aktivGroteskBold px-2 py-1 text-light-100 text-xl'>
                      {credit.date}
                    </p>
                    <p className='flex justify-start font-aktivGroteskLight px-2 py-1 text-light-100 text-xs -mt-1'>
                      {credit.item}
                    </p>
                  </span>
                </div>
              ))}
      </div>

      <div className='flex justify-between items-center py-3 gap-5 border-y-[1px] border-dark-500 text-light-400'>
        <button
          onClick={handlePreviousPage}
          disabled={page === 1}
          className='p-2 text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-30 active:bg-dark-600 active:border-light-100 '
          aria-label='Previous Page'
        >
          <GoChevronLeft />
        </button>

        <span className='flex gap-2 font-aktivGroteskRegular select-none'>
          Page <p className='font-aktivGroteskBold'>{page}</p> of
          <p className='font-aktivGroteskBold'>{totalPages}</p>
        </span>

        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className='p-2 text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-30 active:bg-dark-600 active:border-light-100 '
          aria-label='Next Page'
        >
          <GoChevronRight />
        </button>
      </div>
    </div>
  )
}