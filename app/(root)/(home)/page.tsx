/* eslint-disable @typescript-eslint/no-unused-vars */
import HeroSection from "@/components/Sections/HeroSection"
import React from "react"
import FAQSection from "@/components/Sections/FAQSection"
import PricingSection from "@/components/Sections/PricingSection"
import ReviewSection from "@/components/Sections/ReviewSection"
import RecomendationsSection from "@/components/Sections/RecomendationsSection"
import CreditsSection from "@/components/Sections/CreditsSection"
// import AlertAnnouncement from "@/components/AlertAnnouncement"

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center __container'>
      {/* <AlertAnnouncement /> */}
      <HeroSection />
      <PricingSection />
      <RecomendationsSection />
      <FAQSection />
      <CreditsSection />
      <ReviewSection />
    </main>
  )
}
