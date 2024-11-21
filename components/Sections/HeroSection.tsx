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
      <div className='flex flex-col justify-start px-5 __container items-center text-center w-full'>
        <h1 className='flex flex-col items-center text-3xl md:text-5xl font-aktivGroteskXBoldItalic text-light-200 mb-4'>
          <span className='text-sm font-mono text-light-400'>
            Premium Apps Account Store Platform #1 In Thailand
          </span>
          Watch More Series, Spend Less Money
        </h1>
        <p className='md:text-xl text-light-200 font-mono text-xs'>
          <Highlight text='Digital Products Platform' /> offering{" "}
          <Highlight text='Premium App Accounts' />, such as{" "}
          <Highlight
            text='Netflix Premium'
            bgcolor='bg-[#e50914] !text-black whitespace-nowrap'
          />{" "}
          and{" "}
          <Highlight
            text='Prime Video'
            bgcolor='bg-[#00aae4] !text-white whitespace-nowrap'
          />
          , at{" "}
          <Highlight
            text='affordable prices'
            bgcolor=' bg-transparent font-aktivGroteskBold text-light-100'
          />
          . We are known for our{" "}
          <Highlight
            text='reliability'
            bgcolor=' bg-transparent font-aktivGroteskBold text-light-100'
          />
          ,{" "}
          <Highlight
            text='fast response times'
            bgcolor=' bg-transparent font-aktivGroteskBold text-light-100'
          />
          , and{" "}
          <Highlight
            text='trusted service'
            bgcolor=' bg-transparent font-aktivGroteskBold text-light-100'
          />
          , delivering excellence and satisfaction for every client.
        </p>
        <div className='flex justify-center items-center gap-5'>
          <Link
            href='/products'
            className='text-light-100 border-b-2 px-2 pt-3 mt-5 font-aktivGroteskBold xl:text-3xl border-primary hover:border-0 hover:bg-primary hover:text-dark-800 duration-500 '
          >
            สั่งซื้อตอนนี้
          </Link>
          <Link
            href='/about-us'
            className='text-light-100 border-b-2 px-2 pt-3 mt-5 font-aktivGroteskBold xl:text-3xl border-primary hover:border-0 hover:bg-primary hover:text-dark-800 duration-500 '
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
