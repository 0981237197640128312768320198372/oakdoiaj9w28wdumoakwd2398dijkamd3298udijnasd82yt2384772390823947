/* eslint-disable @typescript-eslint/no-unused-vars */
import HeroSection from "@/components/Sections/HeroSection"
import React from "react"
import FAQSection from "@/components/Sections/FAQSection"

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center __container'>
      <HeroSection />
      <FAQSection />
    </main>
  )
}
