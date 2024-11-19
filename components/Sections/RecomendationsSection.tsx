/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-async-client-component */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from "react"
import SubTitle from "@/components/SubTitle"
import { convertGoogleDriveUrl } from "@/lib/utils"
import Image from "next/image"
import dokmailogosquare from "@/assets/images/dokmailogosquare.png"
import Link from "next/link"
import { GoChevronRight } from "react-icons/go"

const fetchRecommendations = async (page: number, limit: number) => {
  const offset = (page - 1) * limit
  const res = await fetch(
    `/api/get_paginated_data?sheet=MovieAndSeriesRecommendation&range=A2:E&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "x-api-key": "1092461893164193047348723920781631",
      },
    },
  )

  if (!res.ok) {
    throw new Error("Failed to fetch data")
  }

  const rawRecommendationsData = await res.json()

  const recommendations = rawRecommendationsData.data
    .map((recommendationsRow: string[]) => ({
      title: recommendationsRow[0],
      description: recommendationsRow[1],
      recommendationsimageUrl: convertGoogleDriveUrl(recommendationsRow[2]),
      netflixUrl: recommendationsRow[3],
      date: recommendationsRow[4],
    }))
    .reverse()

  return recommendations
}
const SkeletonLoader = () => {
  return (
    <div className='relative flex-grow flex flex-col items-center h-full w-full md:min-w-[500px] justify-center select-none p-3 border-[1px] border-dark-500 rounded-lg animate-pulse'>
      <div className='w-full h-full min-h-[500px] bg-dark-400 rounded-md'>
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
      <span className='flex flex-col w-full justify-start gap-0 mt-3'>
        <div className='h-6 bg-dark-400 rounded w-3/4 mt-2'></div>
        <div className='h-4 bg-dark-400 rounded w-1/2 mt-1'></div>
      </span>
      <div className='flex w-full justify-end mt-3'>
        <div className='h-8 w-24 bg-dark-400 rounded-sm'></div>
      </div>
    </div>
  )
}
const RecomendationsSection = () => {
  const [recommendationsData, setRecommendationsData] = useState<any[]>([])
  const [limit] = useState(4)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const recommendations = await fetchRecommendations(1, limit)
        setRecommendationsData(recommendations)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [limit])
  return (
    <section
      id='Recommendations'
      className='w-full __container mt-24 flex flex-col'
    >
      <SubTitle
        title='Our Recommendations'
        buttonMore='View More Recommendations'
        urlButtonMore={"/movie-series-recommendations"}
        className='mb-16'
      />
      <div className='w-full h-full grid lg:grid-cols-2 gap-5 px-5 lg:px-0 pb-10'>
        {loading
          ? Array.from({ length: limit }).map((_, index) => (
              <>
                <SkeletonLoader key={index} />
              </>
            ))
          : recommendationsData
              .slice()
              .reverse()
              .map((recommendation, index: number) => (
                <div
                  key={index}
                  className='relative flex flex-col items-center h-full w-full justify-center select-none p-3 border-[1px] border-dark-500 rounded-lg'
                >
                  <Image
                    src={recommendation.recommendationsimageUrl}
                    alt={`Movies and Series Recommendation by Dokmai Store | ${recommendation.title}`}
                    placeholder='blur'
                    blurDataURL='@/assets/images/blurCredits.jpg'
                    width={500}
                    height={500}
                    className='rounded-md overflow-hidden select-none w-auto h-auto'
                    loading='lazy'
                  />
                  <span className='flex flex-col w-full justify-start gap-0 mt-3'>
                    <p className='flex justify-start font-aktivGroteskBold px-2 py-1 text-light-100 text-xl'>
                      {recommendation.title}
                    </p>
                    <p className='flex justify-start font-aktivGroteskLight px-2 py-1 text-light-100 text-xs -mt-1'>
                      {recommendation.description}
                    </p>
                  </span>
                  <div className='flex w-full justify-end mt-3'>
                    <Link
                      href={recommendation.netflixUrl}
                      className='bg-primary py-1 px-2 text-dark-800 font-aktivGroteskBold rounded-sm flex items-center justify-center gap-1'
                      target='_blank'
                    >
                      Watch Now
                      <GoChevronRight className='text-2xl' />
                    </Link>
                  </div>
                </div>
              ))}
      </div>
    </section>
  )
}

export default RecomendationsSection
