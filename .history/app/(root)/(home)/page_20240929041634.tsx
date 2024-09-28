import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center bg-blue-500'>
      <div className='flex justify-center items-center bg-red-500 pt-12'>
        <TextHoverEffect text='DOKMAI' />
      </div>
      <HeroSection />
    </main>
  )
}
