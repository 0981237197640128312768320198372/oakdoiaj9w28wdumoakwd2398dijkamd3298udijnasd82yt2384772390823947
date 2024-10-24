import React from "react"

import { Reviews } from "@/components/Reviews"
import { FiveStarsReview, FiveStarsReview2 } from "@/constant"
import SubTitle from "../SubTitle"

const ReviewSection = () => {
  return (
    <section
      id='5StarsReviews'
      className='h-[40rem] w-screen px-5 lg:p-0 rounded-md flex flex-col antialiased bg-transparent items-center justify-center relative overflow-hidden mt-20 __container'
    >
      <SubTitle title='Feedback' className='mb-16 __container' />
      <Reviews reviewsData={FiveStarsReview} direction='right' speed='slow' />
      <Reviews reviewsData={FiveStarsReview2} direction='left' speed='slow' />
    </section>
  )
}

export default ReviewSection
