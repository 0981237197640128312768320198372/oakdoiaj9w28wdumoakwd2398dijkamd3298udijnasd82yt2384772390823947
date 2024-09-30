"use client"

import Link from "next/link"
import React from "react"
const Highlight = ({ text }: { text: string }) => (
  <span className='text-dark-800 bg-primary px-1'>{text}</span>
)
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
          Netflix Premium <Highlight text='คุณภาพสูง' /> ราคาถูก
          พร้อมรับประกันตลอดชีพจาก Dokmai Store
          แพลตฟอร์มสินค้าดิจิทัลที่ดีที่สุดในประเทศไทย มอบบริการ
          <Highlight text='Netflix Premium' />
          ที่เชื่อถือได้ในราคาย่อมเยา พร้อม
          <Highlight text='การสนับสนุนลูกค้าที่รวดเร็ว' />
          เราการันตีบริการคุณภาพและ
          <Highlight text='การช่วยเหลืออย่างทันที' />
          เพื่อให้คุณเพลิดเพลินกับการชมภาพยนตร์และซีรีส์ได้อย่างเต็มอิ่ม
        </p>
        <Link
          href='https://lin.ee/Ovlixv5'
          target='_blank'
          className='text-light-100 border-b-2 px-2 pt-4 mt-5 font-aktivGroteskBold xl:text-3xl border-primary hover:border-0 hover:bg-primary hover:text-dark-800 duration-500'
        >
          สั่งซื้อตอนนี้
        </Link>
      </div>
    </section>
  )
}

export default HeroSection
