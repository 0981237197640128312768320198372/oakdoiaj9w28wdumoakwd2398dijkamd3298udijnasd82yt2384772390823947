import Image from "next/image"
import dokmailogosquare from "@/assets/images/dokmailogosquare.png"

const Loading = () => {
  return (
    <div className='w-full min-h-[500px] flex justify-center items-center'>
      <div className='relative flex items-center justify-center'>
        <div className='w-32 h-32 border-2 border-b-transparent border-primary rounded-full animate-spin'></div>
        <Image
          src={dokmailogosquare}
          alt='Loading Logo | Dokmai Store'
          width={200}
          height={200}
          className='absolute p-5'
        />
      </div>

      {/* <div className='flex flex-col w-screen h-screen justify-center items-center bg-dark-800'>
        <Image
          width={400}
          height={400}
          src={dokmaioutline}
          alt='Loading...'
          className='opacity-50'
        />
        <p className='font-aktivGroteskItalic text-lg cursor-default select-none'>
          Loading...
        </p>
      </div> */}
    </div>
  )
}

export default Loading
