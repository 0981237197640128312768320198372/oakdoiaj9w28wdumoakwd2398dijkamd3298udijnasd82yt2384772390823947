import Image from "next/image"
import dokmailogo from "@/assets/images/dokmailogo.png"

const Loading = () => {
  return (
    <div className='absolute z-[999] top-0 left-0'>
      <div className='flex flex-col w-screen h-screen justify-center items-center gap-1 bg-dark-800'>
        <div className='bg-red-400 flex'>
          <Image
            width={100}
            height={100}
            src={dokmailogo}
            alt='Loading...'
            className=' absolute duration-700'
          />
          <Image
            width={100}
            height={100}
            src={dokmailogo}
            alt='Loading...'
            className='absolute duration-700'
          />
        </div>

        <p className='font-aktivGroteskItalic text-lg cursor-default select-none'>
          Loading...
        </p>
      </div>
    </div>
  )
}

export default Loading
