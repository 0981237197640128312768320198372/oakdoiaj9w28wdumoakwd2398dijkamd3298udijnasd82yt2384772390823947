"use client"

import React from "react"
import Image from "next/image"
import wsnoutline from "@/assets/images/wsnoutline.png"
import wsnoutlinelong from "@/assets/images/wsnoutlinelong.png"

const HeroSection = () => {
  return (
    <main className='w-screen h-screen'>
      <div className='w-full flex flex-col gap-12'>
        <div className='flex items-end md:items-start h-full'>
          <Image
            src={wsnoutline}
            alt='wsn'
            width={800}
            height={800}
            className='lg:hidden'
          />
          <Image
            src={wsnoutlinelong}
            alt='wsn'
            width={800}
            height={800}
            className='hidden lg:block'
          />
        </div>
        <div className='flex items-end'>
          <div className='flex flex-col lg:max-w-[700px] h-fit gap-5'>
            <div className='flex flex-col justify-start gap-2'>
              <span className='font-sans text-xs tracking-widest'>
                WatchSeriesNow Payment Page
              </span>
              <span className='font-mono opacity-65'>
                Select the plan you want, and click the payment link. After
                completing your payment via Stripe, simply send us a screenshot
                of the confirmation. It&apos;s that easy to continue enjoying
                your Netflix access!
              </span>
              <button
                className='flex px-3 py-2 text-dark-300 w-fit border-2 bg-white border-primary hover:bg-primary hover:text-white'
                onClick={() => {
                  window.location.href = "/products"
                }}
              >
                <span className='flex flex-col text-start'>Pay Now!</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HeroSection
