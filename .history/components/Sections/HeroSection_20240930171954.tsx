"use client"

import Link from "next/link"
import React from "react"

const HeroSection = () => {
  return (
    <section
      id='HeroSection'
      className='flex flex-col justify-start items-center px-5 __container gap-10'
    >
      <div className='flex flex-col justify-start items-center text-center w-full'>
        <h1 className='text-3xl md:text-5xl font-aktivGroteskXBoldItalic text-light-200 mb-4'>
          Watch More Series, <br className='sm:hidden' /> Spend Less Money
        </h1>
        <p className='md:text-xl text-light-200 font-mono text-xs'>
          <span className='text-dark-800 bg-primary px-1'>Netflix Premium</span>{" "}
          คุณภาพสูง ราคาถูก พร้อมรับประกันตลอดชีพจาก Dokmai Store
          แพลตฟอร์มสินค้าดิจิทัลที่ดีที่สุด{" "}
          <span className='text-dark-800 bg-primary px-1'>ในประเทศไทย</span>{" "}
          รับบริการ Netflix Premium ที่เชื่อถือได้ ในราคาย่อมเยา
          พร้อมการสนับสนุนลูกค้าที่รวดเร็ว เรารับประกันบริการ{" "}
          <span className='text-dark-800 bg-primary px-1'>คุณภาพสูง</span>{" "}
          และความช่วยเหลือที่อย่างทันที
          เพื่อให้คุณได้รับประสบการณ์การชมภาพยนตร์และซีรีส์{" "}
          <span className='text-dark-800 bg-primary px-1'>ที่ดีที่สุด</span>{" "}
        </p>
        <Link
          href='https://lin.ee/Ovlixv5'
          target='_blank'
          className='text-light-100 border-b-2 px-2 py-3 mt-5 font-aktivGroteskBold xl:text-3xl border-primary hover:border-0 hover:bg-primary hover:text-dark-800 duration-500'
        ></Link>
      </div>
    </section>
  )
}

export default HeroSection
