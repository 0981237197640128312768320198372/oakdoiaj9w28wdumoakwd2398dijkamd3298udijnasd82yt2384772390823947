import Image from "next/image"
import dokmailogo from "@/assets/images/dokmailogo.png"
import dokmaioutline from "@/assets/images/dokmaioutline.png"

const Loading = () => {
  return (
    <div className='absolute z-[999] top-0 left-0'>
      <div className='flex flex-col w-screen h-screen justify-center items-center bg-dark-800'>
        <div className='relative w-[100px] h-[100px]'>
          {/* First Image */}
          <Image
            width={100}
            height={100}
            src={dokmaioutline}
            alt='Loading...'
            className='absolute top-0 left-0 duration-700'
          />
          {/* Second Image (stacked on top of the first one) */}
          <Image
            width={100}
            height={100}
            src={dokmailogo}
            alt='Loading...'
            className='absolute top-0 left-0 duration-700'
          />
        </div>
        {/* <p className='font-aktivGroteskItalic text-lg cursor-default select-none'>
          Loading...
        </p> */}
      </div>
    </div>
  )
}

export default Loading
