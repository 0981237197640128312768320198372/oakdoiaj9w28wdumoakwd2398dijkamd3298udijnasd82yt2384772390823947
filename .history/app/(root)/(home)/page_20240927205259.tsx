import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <div>
      <div className='items-start justify-start flex flex-col h-[40rem] w-screen'>
        <TextHoverEffect />
      </div>

      <HeroSection />
    </div>
  )
}
