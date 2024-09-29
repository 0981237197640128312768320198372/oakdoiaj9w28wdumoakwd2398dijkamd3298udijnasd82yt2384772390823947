/* eslint-disable @typescript-eslint/no-unused-vars */
import HeroSection from "@/components/Sections/HeroSection"
import { DOKMAI } from "@/components/DOKMAI"
import React from "react"
import Loading from "@/components/Loading"

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center __container'>
      <div className='flex justify-center items-center pt-24'>
        <DOKMAI text='DOKMAI' />
      </div>
      <HeroSection />
    </main>
  )
}
