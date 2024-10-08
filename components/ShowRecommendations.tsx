/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { timeAgo } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { MdPlayCircleOutline } from "react-icons/md"
import Loading from "@/components/Loading"

export default function ShowRecommendations({
  recommendations,
}: {
  recommendations: any[]
}) {
  const [recommendationsIsLoading, setRecommendationsIsLoading] = useState(true)

  useEffect(() => {
    const imageRecommendationsUrls = recommendations
      .map((recommendation: any) => recommendation.recommendationsimageUrl)
      .filter((url: string) => url) // Ensure valid URLs

    const preloadImages = async () => {
      try {
        await Promise.all(
          imageRecommendationsUrls.map((url: string) => {
            return new Promise<void>((resolve) => {
              const img = new window.Image()
              img.src = url
              img.onload = () => resolve()
              img.onerror = () => resolve() // Handle errors gracefully
            })
          })
        )
        setRecommendationsIsLoading(false)
      } catch (error) {
        console.error("Error preloading images", error)
        setRecommendationsIsLoading(false) // Fail gracefully
      }
    }

    preloadImages()
  }, [recommendations])

  if (recommendationsIsLoading) {
    return <Loading />
  }

  return (
    <div className='flex flex-col justify-center w-full h-full items-center'>
      <div className='grid grid-cols-2 w-fit h-full gap-4 pb-10'>
        {recommendations.map((recommendation, index: number) => (
          <div
            key={index}
            className='relative flex flex-col items-center h-full w-full justify-center border-dark-500 border-[1px] rounded-2xl p-5 select-none'
          >
            <p className='flex justify-start font-aktivGroteskLight px-2 py-1 text-light-100 text-xs mb-2'>
              {recommendation.date} | (Posted {timeAgo(recommendation.date)})
            </p>
            <Image
              src={recommendation.recommendationsimageUrl}
              alt={`Movies and Series Recommendation by Dokmai Store | ${recommendation.title}`}
              placeholder='blur'
              blurDataURL='/assets/images/blurCredits.jpg' // Corrected blur image
              width={500}
              height={500}
              className='rounded-xl overflow-hidden select-none w-auto h-auto'
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
                Watch Now <MdPlayCircleOutline className='text-xl' />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
