import HeroSection from "@/components/HeroSection"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"

export default function Home() {
  return (
    <div>
      <div className='w-full flex flex-col pt-24 gap-10'>
        <div className='items-center justify-center flex flex-col  h-fit pt-36'>
          <TextHoverEffect />
        </div>
      </div>

      <HeroSection />
    </div>
  )
}
