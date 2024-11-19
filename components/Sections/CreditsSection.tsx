"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react"
import dokmailogosquare from "@/assets/images/dokmailogosquare.png"
import SubTitle from "@/components/SubTitle"
import Image from "next/image"
import { convertGoogleDriveUrl } from "@/lib/utils"

const fetchCredits = async (page: number, limit: number) => {
  const offset = (page - 1) * limit
  const res = await fetch(
    `/api/get_paginated_data?sheet=CreditsOrTestimonials&range=A2:C&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "x-api-key": "1092461893164193047348723920781631",
      },
    },
  )

  if (!res.ok) {
    throw new Error("Failed to fetch data")
  }

  const rawCreditsData = await res.json()

  const creditsData = rawCreditsData.data
    .map((creditsRow: string[]) => ({
      creditsimageUrl: convertGoogleDriveUrl(creditsRow[0]),
      item: creditsRow[1],
      date: creditsRow[2],
    }))
    .reverse()

  return creditsData
}

const SkeletonLoader = () => {
  return (
    <div className='relative flex-grow flex flex-col items-center h-full w-screen md:min-w-[350px] max-w-full min-h-[800px] max-h-full justify-center select-none p-3 border-[1px] border-dark-500 rounded-lg animate-pulse'>
      <div className='w-full min-h-[800px] h-full bg-dark-400 rounded-md'>
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
const CreditsSection = () => {
  const [creditsData, setCreditsData] = useState<any[]>([])
  const [limit] = useState(3)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const recommendations = await fetchCredits(1, limit)
        setCreditsData(recommendations)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [limit])
  return (
    <section id='Testimonials' className='mt-24'>
      <SubTitle
        title='Credits'
        buttonMore='View More Credits'
        urlButtonMore={"/testimonials"}
        className='mb-16'
      />
      <div className='w-fit h-full grid md:grid-cols-2 lg:grid-cols-3 gap-5 px-5 lg:px-0 pb-10'>
        {loading
          ? Array.from({ length: limit }).map((_, index) => (
              <>
                <SkeletonLoader key={index} />
              </>
            ))
          : creditsData
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
    </section>
  )
}

export default CreditsSection
