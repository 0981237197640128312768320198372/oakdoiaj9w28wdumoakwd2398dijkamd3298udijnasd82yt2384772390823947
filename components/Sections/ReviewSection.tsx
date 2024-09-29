import React from "react"

import { Reviews } from "@/components/Reviews"
import { FiveStarsReview, FiveStarsReview2 } from "@/constant"

const ReviewSection = () => {
  return (
    <section
      id='5StarsReviews'
      className='h-[40rem] rounded-md flex flex-col antialiased bg-transparent items-center justify-center relative overflow-hidden'
    >
      <Reviews reviewsData={FiveStarsReview} direction='right' speed='slow' />
      <Reviews reviewsData={FiveStarsReview2} direction='left' speed='slow' />
    </section>
  )
}

export default ReviewSection
