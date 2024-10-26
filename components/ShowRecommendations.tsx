/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
// import { timeAgo } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { GoChevronRight } from "react-icons/go"
import { GoChevronLeft } from "react-icons/go"
import Loading from "./Loading"
import { MdOutlineArrowOutward } from "react-icons/md"
import { unstable_noStore as noStore } from "next/cache"

export default function ShowRecommendations({
  recommendations,
  paginations,
  itemsperPage,
}: {
  recommendations: any[]
  paginations: boolean
  itemsperPage: number
}) {
  noStore()
  const itemsPerPage = itemsperPage
  const totalPages = Math.ceil(recommendations.length / itemsPerPage)

  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const currentPageData = recommendations.slice(startIndex, endIndex)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  useEffect(() => {
    const imageRecommendationsUrls = recommendations.map(
      (recommendation: any) => recommendation.recommendationsimageUrl,
    )

    const preloadImages = async () => {
      await Promise.all(
        imageRecommendationsUrls.map((url: string) => {
          return new Promise<void>((resolve) => {
            const img = new window.Image()
            img.src = url
            img.onload = () => resolve()
            img.onerror = () => resolve()
          })
        }),
      )
      setIsLoading(false)
    }

    preloadImages()
  }, [recommendations])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className='flex flex-col justify-center w-full h-full items-center'>
      <div className='flex w-fit h-full max-md:flex-col gap-5 pb-10'>
        {currentPageData.map((recomendation, index: number) => (
          <div
            key={index}
            className='relative flex flex-col items-center h-full w-full justify-center select-none p-3 border-[1px] border-dark-500 rounded-lg'
          >
            <Image
              src={recomendation.recommendationsimageUrl}
              alt={`Movies and Series Recommendation by Dokmai Store | ${recomendation.title}`}
              placeholder='blur'
              blurDataURL='@/assets/images/blurCredits.jpg'
              width={500}
              height={500}
              className='rounded-md overflow-hidden select-none w-auto h-auto'
              loading='lazy'
            />
            <span className='flex flex-col w-full justify-start gap-0 mt-3'>
              <p className='flex justify-start font-aktivGroteskBold px-2 py-1 text-light-100 text-xl'>
                {recomendation.title}
              </p>
              <p className='flex justify-start font-aktivGroteskLight px-2 py-1 text-light-100 text-xs -mt-1'>
                {recomendation.description}
              </p>
            </span>
            <div className='flex w-full justify-end mt-3'>
              <Link
                href={recomendation.netflixUrl}
                className='bg-primary py-1 px-2 text-dark-800 font-aktivGroteskBold rounded-sm flex items-center justify-center gap-1'
                target='_blank'
              >
                Watch Now <MdOutlineArrowOutward className='text-2xl' />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {paginations && (
        <div className='flex justify-between items-center py-3 gap-5 border-y-[1px] border-dark-500 text-light-400'>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className='p-2 text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-30 active:bg-dark-600 active:border-light-100 '
            aria-label='Previous Page'
          >
            <GoChevronLeft />
          </button>

          <span className='flex gap-2 font-aktivGroteskRegular select-none'>
            Page <p className='font-aktivGroteskBold'>{currentPage}</p> of
            <p className='font-aktivGroteskBold'>{totalPages}</p>
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className='p-2 text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-30 active:bg-dark-600 active:border-light-100 '
            aria-label='Next Page'
          >
            <GoChevronRight />
          </button>
        </div>
      )}
    </div>
  )
}
