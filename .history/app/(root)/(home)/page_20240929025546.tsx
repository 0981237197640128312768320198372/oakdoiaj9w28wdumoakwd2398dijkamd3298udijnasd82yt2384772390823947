import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <main className='flex flex-col justify-center'>
      <div className='flex justify-center items-center'>
        <TextHoverEffect text='DOKMAI' />
      </div>
      <HeroSection />
    </main>
  )
}
