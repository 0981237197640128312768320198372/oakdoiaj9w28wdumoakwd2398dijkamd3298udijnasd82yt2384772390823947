import HeroSection from "@/components/HeroSection"
import { DOKMAI } from "@/components/ui/DOKMAI"

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center'>
      <div className='flex justify-center items-center pt-24'>
        <DOKMAI text='DOKMAI' />
      </div>
      <HeroSection />
    </main>
  )
}
