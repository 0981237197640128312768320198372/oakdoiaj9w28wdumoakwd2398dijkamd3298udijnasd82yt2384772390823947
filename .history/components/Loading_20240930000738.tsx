import Image from "next/image"
import dokmailogo from "@/assets/images/dokmailogo.png"
import dokmaioutline from "@/assets/images/dokmaioutline.png"

const Loading = () => {
  return (
    <div className='absolute z-[999] top-0 left-0'>
      <div className='flex flex-col w-screen h-screen justify-center items-center bg-dark-800'>
        <Image
          width={400}
          height={400}
          src={dokmaioutline}
          alt='Loading...'
          className=''
        />
        <p className='font-aktivGroteskItalic text-lg cursor-default select-none'>
          Loading...
        </p>
      </div>
    </div>
  )
}

export default Loading
