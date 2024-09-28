"use client"

import React from "react"
import { FaBahtSign } from "react-icons/fa6"
import { TextHoverEffect } from "./ui/text-hover-effect"

const HeroSection = () => {
  return (
    <main className='w-full flex justify-center items-center'>
      <div className='w-full flex flex-col gap-12'>
        <div className='items-center justify-center flex flex-col w-full h-fit'>
          <TextHoverEffect text='DOKMAI' />
        </div>
        <div className='flex items-end'>
          <div className='flex flex-col lg:max-w-[700px] h-fit gap-5'>
            <div className='flex flex-col justify-start gap-2'>
              <span className='font-sans text-xs tracking-widest'>
                หน้าการชำระเงิน Dokmai Store
              </span>
              <span className='font-mono opacity-65'>
                เลือกแพ็กเกจที่คุณสนใจ &gt; กดลิ้งค์สำหรับชำระเงิน &gt;
                เลือกวิธีการชำระเงิน &gt; ส่งหลังฐานยืนยันการชำระเงิน
                เพียงเท่านี้คุณก็สามารถรับชม Netflix Premium ได้สมใจ!
              </span>
              <button
                className='flex px-3 py-2 text-dark-300 w-fit border-2 bg-transparent font-wsnfont border-primary hover:bg-primary hover:text-black'
                onClick={() => {
                  window.location.href = "/payments"
                }}
              >
                <span className='flex items-center justify-center gap-1'>
                  <FaBahtSign className='text-xl' />
                  Pay Now
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HeroSection
