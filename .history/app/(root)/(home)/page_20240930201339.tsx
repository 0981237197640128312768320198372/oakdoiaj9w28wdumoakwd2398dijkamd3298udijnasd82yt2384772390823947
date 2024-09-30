/* eslint-disable @typescript-eslint/no-unused-vars */
import HeroSection from "@/components/Sections/HeroSection"
import { DOKMAI } from "@/components/DOKMAI"
import React from "react"
import FAQSection from "@/components/Sections/FAQSection"

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center __container'>
      <div className='flex justify-center items-center pt-24'>
        <DOKMAI text='DOKMAI' />
      </div>
      <HeroSection />
      <FAQSection />
    </main>
  )
}
