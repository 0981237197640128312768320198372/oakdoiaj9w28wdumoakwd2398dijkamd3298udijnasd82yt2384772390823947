"use client"

import Link from "next/link"
import React from "react"
import { Features } from "@/components/Features"
import { features } from "@/constant"
import { DOKMAI } from "@/components/DOKMAI"
const Highlight = ({
  text,
  bgcolor = "bg-primary",
}: {
  text: string
  bgcolor?: string
}) => <span className={`text-dark-800 ${bgcolor} px-1`}>{text}</span>
const HeroSection = () => {
  return (
    <section
      id='HeroSection'
      className='flex flex-col w-full justify-start items-center'
    >
      <DOKMAI text='DOKMAI' />
      <div className='flex flex-col justify-start px-5 __container items-start text-center w-full'>
        <h1 className='flex flex-col items-start text-3xl md:text-5xl font-aktivGroteskXBoldItalic text-light-200 mb-1'>
          ดูซีรีส์มากขึ้น ใช้เงินน้อยลง
          <span className='text-sm font-mono text-light-400'>
            แพลตฟอร์มร้านบัญชีแอปพรีเมียมอันดับ 1 ในประเทศไทย
          </span>
        </h1>
        <p className='md:text-xl text-light-200 text-start font-mono text-xs'>
          <Highlight text='แพลตฟอร์มสินค้า ดิจิทัล' />
          ที่นำเสนอ
          <Highlight text='บัญชีแอปพรีเมียม' />
          เช่น
          <Highlight
            text='Netflix Premium'
            bgcolor='bg-[#e50914] !text-black whitespace-nowrap'
          />
          และ
          <Highlight
            text='Prime Video'
            bgcolor='bg-[#00aae4] !text-white whitespace-nowrap'
          />
          ใน
          <Highlight
            text='ราคาที่จับต้องได้'
            bgcolor=' bg-transparent font-aktivGroteskBold text-light-100'
          />
          เราเป็นที่รู้จักในด้าน
          <Highlight
            text='ความน่าเชื่อถือ'
            bgcolor=' bg-transparent font-aktivGroteskBold text-light-100'
          />
          <Highlight
            text='การตอบกลับที่รวดเร็ว'
            bgcolor=' bg-transparent font-aktivGroteskBold text-light-100'
          />
          และ
          <Highlight
            text='บริการที่คุณไว้วางใจได้'
            bgcolor=' bg-transparent font-aktivGroteskBold text-light-100'
          />
          มอบความเป็นเลิศและความพึงพอใจให้กับลูกค้าทุกคน
        </p>
        <div className='flex w-full justify-end items-center gap-5 mt-1'>
          <Link
            href='/products'
            className='text-light-100 border-b-2 px-2 pt-3 font-aktivGroteskBold xl:text-3xl border-primary hover:border-0 hover:bg-primary hover:text-dark-800 duration-500 '
          >
            สั่งซื้อตอนนี้
          </Link>
          <Link
            href='/about-us'
            className='text-light-100 border-b-2 px-2 pt-3 font-aktivGroteskBold xl:text-3xl border-primary hover:border-0 hover:bg-primary hover:text-dark-800 duration-500 '
          >
            เกี่ยวกับเรา
          </Link>
        </div>
      </div>

      <div className='pt-24 overflow-hidden relative w-full'>
        <Features text={features} />
      </div>
    </section>
  )
}

export default HeroSection
