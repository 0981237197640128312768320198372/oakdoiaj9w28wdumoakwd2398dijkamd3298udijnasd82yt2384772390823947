import Image from "next/image"
import React from "react"
import dokmaistorefooter from "@/assets/images/dokmaistorefooter.png"

const Footer = () => {
  return (
    <footer className='flex justify-center items-center w-full '>
      <div className='flex w-ful flex-col justify-center __container items-center py-3 border-t-[1px] border-dark-500'>
        <div className=' w-full'>
          <p className='text-dark-500 text-sm font-aktivGroteskThin'>
            �� 2022 Dokmai Store. All rights reserved.
          </p>
        </div>

        <Image
          src={dokmaistorefooter}
          alt='Footer Image - Dokmai Store'
          className='opacity-65'
        />
      </div>
    </footer>
  )
}

export default Footer
