import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <div>
      <div className='w-full flex flex-col'>
        <div className='items-center justify-center flex flex-col w-full h-fit'>
          <TextHoverEffect text='DOKMAI' />
        </div>
        <div className='items-center justify-center flex flex-col w-full h-fit'>
          <TextHoverEffect text='STORE' />
        </div>
      </div>

      <HeroSection />
    </div>
  )
}
