"use client"

import React from "react"
import Image from "next/image"
import wsnoutline from "@/assets/images/wsnoutline.png"
import wsnoutlinelong from "@/assets/images/wsnoutlinelong.png"
import { FaBahtSign } from "react-icons/fa6"

const HeroSection = () => {
  return (
    <main className='w-full flex justify-center items-center'>
      <div className='w-full flex flex-col gap-12'>
        <div className='flex items-end md:items-start h-full'>
          <Image
            src={wsnoutline}
            alt='wsn'
            width={800}
            height={800}
            className='lg:hidden'
          />
          <Image
            src={wsnoutlinelong}
            alt='wsn'
            width={800}
            height={800}
            className='hidden lg:block'
          />
        </div>
        <div className='flex items-end'>
          <div className='flex flex-col lg:max-w-[700px] h-fit gap-5'>
            <div className='flex flex-col justify-start gap-2'>
              <span className='font-sans text-xs tracking-widest'>
                หน้าการชำระเงิน WatchSeriesNow
              </span>
              <span className='font-mono opacity-65'>
                เลือกแพ็กเกจที่คุณสนใจ, กดลิ้งค์สำหรับชำระเงิน
                ชำระเงินผ่านระบบของ Stripe ส่งหลังฐานยืนยันการชำระเงิน
                เพียงเท่านี้คุณก็สามารถรับชม Netflix Premium ได้สมใจ!
              </span>
              <button
                className='flex px-3 py-2 text-dark-300 w-fit border-2 bg-transparent font-wsnfont border-primary hover:bg-primary hover:text-black'
                onClick={() => {
                  window.location.href = "/payment"
                }}
              >
                <span className='flex items-center justify-center gap-2'>
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
