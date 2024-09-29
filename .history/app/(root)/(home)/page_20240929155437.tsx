import HeroSection from "@/components/HeroSection"
import { DOKMAI } from "@/components/ui/DOKMAI"
import { Reviews } from "@/components/ui/Reviews"

import { FiveStarsReview, FiveStarsReview2 } from "@/constant"

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center'>
      <div className='flex justify-center items-center pt-24'>
        <DOKMAI text='DOKMAI' />
      </div>
      <HeroSection />
      <div className='h-[40rem] rounded-md flex flex-col antialiase dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden'>
        <Reviews reviewsData={FiveStarsReview} direction='right' speed='slow' />
        <Reviews reviewsData={FiveStarsReview2} direction='left' speed='slow' />
      </div>
    </main>
  )
}
