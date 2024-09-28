import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center'>
      <div className='flex justify-center items-center pt-24'>
        <TextHoverEffect text='DOKMAI' />
      </div>
      <HeroSection />
    </main>
  )
}
