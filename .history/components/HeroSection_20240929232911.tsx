"use client"

import Link from "next/link"
import React from "react"

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
      <Link
        href='https://lin.ee/Ovlixv5'
        target='_blank'
        className='text-light-100 border-b-2 px- py-3 text-lg font-aktivGroteskBold'
      >
        Order Now!
      </Link>
    </section>
  )
}

export default HeroSection
