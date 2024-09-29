import Image from "next/image"
import React from "react"
import dokmaistorefooter from "@/assets/images/dokmaistorefooter.png"

const Footer = () => {
  return (
    <footer className='flex justify-center items-center w-full '>
      <div className='flex w-full justify-center __container items-center py-3 border-t-[1px] border-dark-500'>
        <p className='text-dark-500 text-sm'>
          �� 2022 Dokmai Store. All rights reserved.
        </p>
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
