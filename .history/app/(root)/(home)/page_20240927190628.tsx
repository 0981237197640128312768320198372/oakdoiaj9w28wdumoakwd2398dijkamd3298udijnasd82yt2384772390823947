import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <div>
      <div className='w-full'>
        <div className='items-center justify-center flex flex-col'>
          <TextHoverEffect text='DOKMAI' />
          <TextHoverEffect text='STORE' />
        </div>
      </div>

      <HeroSection />
    </div>
  )
}
