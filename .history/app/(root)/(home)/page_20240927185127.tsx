import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <div>
      <div className='flex items-center justify-center'>
        <TextHoverEffect
          text={
            <>
              <span className='block sm:hidden'>DOKMAI</span>
              <span className='block sm:hidden'>STORE</span>
              <span className='hidden sm:block'>DOKMAI STORE</span>
            </>
          }
        />
      </div>
      <HeroSection />
    </div>
  )
}
