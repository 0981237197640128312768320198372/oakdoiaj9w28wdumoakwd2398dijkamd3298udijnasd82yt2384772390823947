"use client"

import React from "react"
import { TextHoverEffect } from "./ui/text-hover-effect"

const HeroSection = () => {
  return (
    <section id='HeroSection' className='flex justify-center items-center'>
      <TextHoverEffect text='DOKMAI' />
    </section>
  )
}

export default HeroSection
