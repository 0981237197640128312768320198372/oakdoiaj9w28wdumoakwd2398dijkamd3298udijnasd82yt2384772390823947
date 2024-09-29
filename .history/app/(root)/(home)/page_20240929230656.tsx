/* eslint-disable @typescript-eslint/no-unused-vars */
import HeroSection from "@/components/HeroSection"
import { DOKMAI } from "@/components/DOKMAI"
import { Reviews } from "@/components/Reviews"
import { FiveStarsReview, FiveStarsReview2 } from "@/constant"
import React from "react"
import SubTitle from "@/components/SubTitle"

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
      <SubTitle
        title='Frequently Question Asked'
        buttonMore='View More Question'
        urlButtonMore='/FAQ'
      />
    </main>
  )
}
