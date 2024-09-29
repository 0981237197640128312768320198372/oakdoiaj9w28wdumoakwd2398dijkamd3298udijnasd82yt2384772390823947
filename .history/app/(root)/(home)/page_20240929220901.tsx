/* eslint-disable @typescript-eslint/no-unused-vars */
import HeroSection from "@/components/HeroSection"
import { DOKMAI } from "@/components/ui/DOKMAI"
import { Reviews } from "@/components/ui/Reviews"
import { FiveStarsReview, FiveStarsReview2 } from "@/constant"
import React from "react"

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center __container'>
      <div className='flex justify-center items-center pt-24'>
        <DOKMAI text='DOKMAI' />
      </div>
      <HeroSection />
      <section
        id='5StarsReviews'
        className='h-[40rem] rounded-md flex flex-col antialiased bg-transparent items-center justify-center relative overflow-hidden'
      >
        <Reviews reviewsData={FiveStarsReview} direction='right' speed='slow' />
        <Reviews reviewsData={FiveStarsReview2} direction='left' speed='slow' />
      </section>
    </main>
  )
}
