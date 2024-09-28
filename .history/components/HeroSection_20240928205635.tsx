"use client"

import React from "react"
import { TextHoverEffect } from "./ui/text-hover-effect"

const HeroSection = () => {
  return (
    <div className='w-full flex justify-center items-center'>
      <div className='items-center justify-center w-full bg-red-400 h-fit'>
        <TextHoverEffect text='DOKMAI' />
      </div>
    </div>
  )
}

export default HeroSection
