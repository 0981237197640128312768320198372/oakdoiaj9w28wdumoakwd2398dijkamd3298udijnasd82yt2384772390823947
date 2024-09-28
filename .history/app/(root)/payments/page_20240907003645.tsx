import Link from "next/link"
import React from "react"

const page = () => {
  return (
    <div className='flex justify-center items-center flex-col gap-24'>
      <div className='flex flex-col items-start'>
        <h1 className='font-wsnfont text-5xl lg:text-7xl'>
          Choose duration you will pay
        </h1>
        <p className='font-mono text-sm'>
          After you pay it, dont forget to screenshot the receipt and sent it on
          line
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10'>
        <Link
          href='https://google.com'
          target='blank'
          className='flex flex-col justify-between items-start py-2 px-3 border-primary border-2 '
        >
          <h6 className='text-xs font-mono'>3 Days</h6>
          <h2 className='flex items-center text-4xl font-extrabold font-sans'>
            ฿20.00
          </h2>
          <p className='text-xs font-mono'>Sharing Access Without TV</p>
        </Link>
      </div>
    </div>
  )
}

export default page
