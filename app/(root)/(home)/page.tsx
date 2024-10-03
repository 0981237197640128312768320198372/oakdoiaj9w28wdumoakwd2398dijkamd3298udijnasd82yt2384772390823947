/* eslint-disable @typescript-eslint/no-unused-vars */
import HeroSection from "@/components/Sections/HeroSection"
import React from "react"
import FAQSection from "@/components/Sections/FAQSection"
import Pricing from "@/components/Sections/Pricing"
import ReviewSection from "@/components/Sections/ReviewSection"

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center __container'>
      <HeroSection />
      <Pricing />
      <FAQSection />
      <ReviewSection />
    </main>
  )
}
