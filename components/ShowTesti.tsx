/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import Image from "next/image"
import { useState } from "react"
import { GoChevronRight } from "react-icons/go"
import { GoChevronLeft } from "react-icons/go"

export default function ShowTesti({ testimonials }: { testimonials: any[] }) {
  const itemsPerPage = 3
  const totalPages = Math.ceil(testimonials.length / itemsPerPage)

  const [currentPage, setCurrentPage] = useState(1)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const currentPageData = testimonials.slice(startIndex, endIndex)

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

  return (
    <div className='flex flex-col justify-center w-full h-full items-center'>
      <div className='flex w-fit h-full max-md:flex-col gap-4 pb-10'>
        {currentPageData.map((testimonial, index: number) => (
          <div
            key={index}
            className='relative flex flex-col items-center h-full w-full justify-center border-dark-500 border-[1px] rounded-xl p-5 select-none'
          >
            {/* <p className='absolute top-0 right-0 px-2 py-1 text-xs select-none  text-primary bg-dark-800 text-end'>
              {testimonial.posted}
            </p> */}

            <Image
              src={testimonial.imageUrl}
              alt={`Credits Or Testimonial Of ${testimonial.item} | Dokmai Store`}
              width={500}
              height={500}
              className='rounded-xl overflow-hidden select-none'
            />
            {/* <p className='absolute bottom-0 left-0 bg-primary px-2 py-1 text-dark-800 text-sm'>
              {testimonial.item}
            </p> */}
            <span className='flex flex-col w-full justify-start'>
              <p className='flex justify-start font-aktivGroteskBold px-2 py-1 text-light-100 text-xl pt-3'>
                {testimonial.item}
              </p>
              <p className='flex justify-start font-aktivGroteskLight px-2 py-1 text-light-100 text-xs'>
                {testimonial.posted}
              </p>
            </span>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className='flex justify-between items-center py-3 gap-5 border-y-[1px] border-dark-500 text-light-400'>
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className='p-2 text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-30 active:bg-dark-600 active:border-light-100 '
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
        >
          <GoChevronRight />
        </button>
      </div>
    </div>
  )
}
