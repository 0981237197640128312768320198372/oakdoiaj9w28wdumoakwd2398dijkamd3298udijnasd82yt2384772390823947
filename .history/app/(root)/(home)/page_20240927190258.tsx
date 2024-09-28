import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <div>
      <div className='w-full bg-dark-300'>
        <div className='items-center justify-center hidden lg:flex'>
          <TextHoverEffect text='DOKMAI STORE' />
        </div>
        <div className='items-center justify-center flex lg:hidden'>
          <TextHoverEffect text='DOKMAI' automatic={true} />
        </div>
      </div>

      <HeroSection />
    </div>
  )
}
