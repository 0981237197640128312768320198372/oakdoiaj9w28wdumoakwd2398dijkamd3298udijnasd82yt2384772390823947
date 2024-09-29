import Image from "next/image"
import React from "react"
import dokmaistorefooter from "@/assets/images/dokmaistorefooter.png"

const Footer = () => {
  return (
    <footer className='flex justify-center items-center w-full  border-t-[1px] border-dark-500'>
      <div className='flex w-full justify-center __container items-center py-3'>
        <Image src={dokmaistorefooter} alt='Footer Image - Dokmai Store' />
      </div>
    </footer>
  )
}

export default Footer
