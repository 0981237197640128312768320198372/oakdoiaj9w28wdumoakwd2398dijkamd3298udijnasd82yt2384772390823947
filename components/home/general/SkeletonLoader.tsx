import Image from "next/image"
import dokmailogosquare from "@/assets/images/dokmailogosquare.png"

const SkeletonLoader = () => {
  return (
    <div className='relative flex-grow flex flex-col items-center h-full w-screen md:w-[500px] justify-center select-none p-3 border-[1px] border-dark-500 rounded-lg animate-pulse'>
      <div className='w-full h-[300px] bg-dark-400 rounded-md'>
        <div className='relative flex items-center justify-center h-full'>
          <div className='w-10 h-10 border-2 border-b-transparent border-primary rounded-full animate-spin'></div>
          <Image
            src={dokmailogosquare}
            alt='Loading Logo | Dokmai Store'
            width={25}
            height={25}
            loading='lazy'
            className='absolute'
          />
        </div>
      </div>
      <span className='flex flex-col w-full justify-start gap-0 mt-3'>
        <div className='h-6 bg-dark-400 rounded w-3/4 mt-2'></div>
        <div className='h-4 bg-dark-400 rounded w-1/2 mt-1'></div>
      </span>
      <div className='flex w-full justify-end mt-3'>
        <div className='h-8 w-24 bg-dark-400 rounded-sm'></div>
      </div>
    </div>
  )
}

export default SkeletonLoader
