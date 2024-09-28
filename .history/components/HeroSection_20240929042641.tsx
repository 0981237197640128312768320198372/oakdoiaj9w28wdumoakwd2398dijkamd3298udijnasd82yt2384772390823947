"use client"

import React from "react"

const HeroSection = () => {
  return (
    <section
      id='HeroSection'
      className='flex flex-col justify-start items-center __container'
    >
      <div className='h-screen flex flex-col justify-start items-center text-center px-4 w-full'>
        <h1 className='text-4xl md:text-6xl font-aktivGroteskMedium text-white mb-4'>
          Watch More Series, <br className='sm:hidden' /> Spend Less Money
        </h1>
        <p className='text-xl md:text-xl text-gray-200 max-w-xl mx-auto bg-red-600 font-mono'>
          High Quality{" "}
          <span className='text-dark-800 bg-primary p-1 text-xs'>
            Netflix Premium
          </span>{" "}
          Cheap Price with Lifetime Warranty – Dokmai Store, the best digital
          goods platform in Thailand. Get reliable, affordable Netflix Premium
          with fast customer support. We guarantee top-quality service and
          immediate assistance, ensuring the best movie and series experience
          for you.
        </p>
      </div>
    </section>
  )
}

export default HeroSection
