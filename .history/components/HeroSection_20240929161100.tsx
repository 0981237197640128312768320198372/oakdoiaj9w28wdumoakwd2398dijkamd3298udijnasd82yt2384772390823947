"use client"

import React from "react"
import { Reviews } from "./ui/Reviews"
import { FiveStarsReview, FiveStarsReview2 } from "@/constant"

const HeroSection = () => {
  return (
    <section
      id='HeroSection'
      className='flex flex-col justify-start items-center px-5 __container gap-10'
    >
      <div className='flex flex-col justify-start items-center text-center w-full'>
        <h1 className='text-3xl md:text-5xl font-aktivGroteskXBoldItalic text-light-200 mb-4'>
          Watch More Series, <br className='sm:hidden' /> Spend Less Money
        </h1>
        <p className='md:text-xl text-light-200 font-mono text-xs'>
          High Quality{" "}
          <span className='text-dark-800 bg-primary px-1'>Netflix Premium</span>{" "}
          Cheap Price with Lifetime Warranty from Dokmai Store, the best digital
          goods platform in{" "}
          <span className='text-dark-800 bg-primary px-1'>Thailand</span> . Get
          reliable, affordable Netflix Premium with fast customer support. We
          guarantee{" "}
          <span className='text-dark-800 bg-primary px-1'>top-quality</span>{" "}
          service and immediate assistance, ensuring the best movie and series
          experience{" "}
          <span className='text-dark-800 bg-primary px-1'>for you.</span>
        </p>
      </div>
      <div className='h-[40rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden'>
        <Reviews reviewsData={FiveStarsReview} direction='right' speed='slow' />
        <Reviews reviewsData={FiveStarsReview2} direction='left' speed='slow' />
      </div>
    </section>
  )
}

export default HeroSection
