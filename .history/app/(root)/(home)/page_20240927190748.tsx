import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <div>
      <div className='w-full top-0'>
        <TextHoverEffect text='DOKMAI' />
        <TextHoverEffect text='STORE' />
      </div>

      <HeroSection />
    </div>
  )
}
