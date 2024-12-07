/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image"
import dokmaicoin from "@/assets/images/dokmaicoin.gif"

const LoadingAnimation = ({ text }: { text?: string }) => {
  return (
    <div className='fixed top-0 left-0 z-[100] w-screen h-screen flex flex-col justify-center items-center bg-dark-800'>
      <div className='relative flex flex-col items-center justify-center gap-3'>
        {/* <div className='w-20 h-20 border-y-[1px] border-y-primary/30 border-x-2 border-x-primary rounded-full animate-spin'></div> */}
        <Image
          src={dokmaicoin}
          alt='Loading Logo | Dokmai Store'
          width={100}
          height={100}
          loading='lazy'
          className='w-32 h-auto'
          unoptimized
        />
      </div>
      <p className='mt-2'>{text}</p>
    </div>
  )
}

export default LoadingAnimation
