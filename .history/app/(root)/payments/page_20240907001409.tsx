import React from "react"

const page = () => {
  return (
    <div className='flex justify-center items-center flex-col gap-10'>
      <div className='flex col items-start'>
        <h1 className='font-wsnfont'>Choose duration you will to pay</h1>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div className='w-5 h-5 bg-red-500'></div>
        <div className='w-5 h-5 bg-red-500'></div>
        <div className='w-5 h-5 bg-red-500'></div>
        <div className='w-5 h-5 bg-red-500'></div>
        <div className='w-5 h-5 bg-red-500'></div>
      </div>
    </div>
  )
}

export default page
