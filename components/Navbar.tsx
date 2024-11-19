/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-no-comment-textnodes */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
"use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import MobileNav from "./MobileNav"
import Image from "next/image"
import dokmaiwithtext from "@/assets/images/dokmaiwithtext.png"
import dokmailogosquare from "@/assets/images/dokmailogosquare.png"
import { navButtons } from "@/constant"
import { TbReload } from "react-icons/tb"
import { PiArrowFatLinesUp } from "react-icons/pi"

const Navbar = () => {
  const path = usePathname()

  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [scrollToTopVisible, setScrollToTopVisible] = useState(false)
  const [visible, setVisible] = useState(true)
  const handleScroll = () => {
    const currentScrollPos = window.pageYOffset
    const isScrollingDown = prevScrollPos < currentScrollPos
    if (currentScrollPos <= 0) {
      // If at the top of the page, make the navbar always visible
      setVisible(true)
      setScrollToTopVisible(false)
    } else {
      setVisible(isScrollingDown)
      setScrollToTopVisible(currentScrollPos > 350)
    }
    setPrevScrollPos(currentScrollPos)
  }
  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  })

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const reloadPage = () => {
    window.location.reload()
  }

  return (
    <>
      <nav
        className={`fixed flex flex-col items-center justify-center top-0 left-0 w-full transition-transform duration-500 z-50 transform  ${
          visible ? "translate-y-0" : "-translate-y-full"
        } z-10`}
      >
        <div className='w-full gap-10 bg-dark-800 flex p-3 pb-6 xl:px-0 xl:pt-10 max-w-[1140px] justify-between duration-1000 items-center '>
          <Link href='/' className='flex select-none items-center gap-1 w-fit'>
            <Image
              width={100}
              height={100}
              src={dokmaiwithtext}
              loading='lazy'
              alt='Logo of Dokmai Store'
              className='duration-700 hidden xl:block'
            />
            <Image
              width={60}
              height={60}
              src={dokmailogosquare}
              loading='lazy'
              alt='Logo of Dokmai Store'
              className='duration-700 xl:hidden'
            />
          </Link>
          <div className='flex items-center justify-end gap-5'>
            <div className='flex justify-end items-center gap-3 font-aktivGroteskBold '>
              <Link
                href='/products'
                className='text-dark-800 bg-primary flex px-2 pt-1 items-center gap-2 text-lg rounded-sm font-aktivGroteskBold'
              >
                ซื้อเลย!
              </Link>
            </div>
          </div>
        </div>
        <div className='w-full gap-10 xl:flex justify-between max-w-[1140px] hidden duration-1000 items-center'>
          <div className='flex w-full justify-between items-center bg-dark-800/70 backdrop-blur py-2'>
            <div className=' w-full flex gap-10 justify-center items-center text-white'>
              {navButtons.map((nav, i) => (
                <Link
                  href={nav.url}
                  key={i}
                  className={`text-light-200 border-b-[1px] border-primary flex-col-reverse py-[3px] hover:py-[1px] duration-300 px-[10px] md:text-sm font-medium group ${
                    path === nav.url
                      ? "font-black transition-transform duration-700 "
                      : ""
                  }${
                    path === nav.url ? " text-primary" : " hover:text-primary"
                  }`}
                >
                  {nav.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <div className='lg:hidden fixed bottom-1/4 -right-1 py-3 pl-3 pr-4 flex flex-col gap-5 z-50 bg-dark-800/30 items-center backdrop-blur-sm border-[1px] border-dark-500 rounded shadow-2xl shadow-black'>
        <button
          onClick={scrollToTop}
          className='duration-500 text-primary text-2xl'
        >
          <PiArrowFatLinesUp />
        </button>
        <button
          onClick={reloadPage}
          className='duration-500 text-primary text-2xl'
        >
          <TbReload />
        </button>
        <MobileNav />
      </div>
    </>
  )
}

export default Navbar
