"use client"

import React from "react"
import { TextHoverEffect } from "./ui/text-hover-effect"

const HeroSection = () => {
  return (
    <section id='HeroSection' className='flex justify-center items-center'>
      <TextHoverEffect text='DOKMAI' />
      <div className='hero bg-cover bg-center h-screen flex flex-col justify-center items-center text-center px-4'>
        <h1 className='text-4xl md:text-6xl font-bold text-white mb-4'>
          Watch More Series, Spend Less Money
        </h1>
        <p className='text-xl md:text-2xl text-gray-200 max-w-xl mx-auto mb-6'>
          Get Netflix Premium and other top streaming apps without breaking the
          bank. Enjoy more shows and movies for less, only at Dokmai Store.
        </p>
        <button className='bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition duration-300'>
          Start Watching Today
        </button>
      </div>
    </section>
  )
}

export default HeroSection
