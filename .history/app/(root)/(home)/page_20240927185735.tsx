import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <div>
      <div className='flex items-center justify-center'>
        <TextHoverEffect text='DOKMAI STORE' />
      </div>
      <HeroSection />
    </div>
  )
}
