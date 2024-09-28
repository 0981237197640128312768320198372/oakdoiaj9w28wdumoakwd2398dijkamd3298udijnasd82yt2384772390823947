import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <div className='p-10'>
      <div className='w-full flex flex-col gap-10'>
        <div className='items-center justify-center flex flex-col w-full h-fit'>
          <TextHoverEffect text='DOKMAI' />
        </div>
      </div>

      <HeroSection />
    </div>
  )
}
