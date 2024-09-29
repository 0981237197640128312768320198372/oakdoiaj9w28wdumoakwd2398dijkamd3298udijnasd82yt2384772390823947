/* eslint-disable @typescript-eslint/no-unused-vars */
import HeroSection from "@/components/Sections/HeroSection"
import { DOKMAI } from "@/components/DOKMAI"
import React from "react"
import SubTitle from "@/components/SubTitle"

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center __container'>
      <div className='flex justify-center items-center pt-24'>
        <DOKMAI text='DOKMAI' />
      </div>
      <HeroSection />
      <SubTitle
        title='Frequently Question Asked'
        buttonMore='View More Question'
        urlButtonMore='/FAQ'
        className='mt-60'
      />
    </main>
  )
}
