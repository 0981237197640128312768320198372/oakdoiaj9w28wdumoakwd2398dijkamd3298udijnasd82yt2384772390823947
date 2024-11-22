/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image"
import dokmailogosquare from "@/assets/images/dokmailogosquare.png"

const Loading = () => {
  return (
    <div className='w-full min-h-screen flex justify-center items-center'>
      <div className='relative flex items-center justify-center'>
        <div className='w-32 h-32 border-y-[1px] border-y-primary/30 border-x-2 border-x-primary rounded-full animate-spin'></div>
        <Image
          src={dokmailogosquare}
          alt='Loading Logo | Dokmai Store'
          width={200}
          height={200}
          loading='lazy'
          className='absolute p-5'
        />
      </div>
    </div>
  )
}

export default Loading
