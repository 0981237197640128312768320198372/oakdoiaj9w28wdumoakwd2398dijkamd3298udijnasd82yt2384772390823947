import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <div>
      <div className='items-center justify-center flex flex-col h-[40rem] w-screen bg-red-600'>
        <TextHoverEffect />
      </div>

      <HeroSection />
    </div>
  )
}
