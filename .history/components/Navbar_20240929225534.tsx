/* eslint-disable react/jsx-no-comment-textnodes */
"use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import MobileNav from "./MobileNav"
import Image from "next/image"
import dokmaiwithtext from "@/assets/images/dokmaiwithtext.png"
import dokmailogo from "@/assets/images/dokmailogo.png"
import { navButtons } from "@/constant"
import { FaLine } from "react-icons/fa6"

const Navbar = () => {
  const path = usePathname()

  const [prevScrollPos, setPrevScrollPos] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  return (
    <nav
      className={`fixed flex flex-col items-center justify-center top-0 left-0 w-full transition-transform duration-500 z-50 transform  ${
        visible ? "translate-y-0" : "-translate-y-full"
      } z-10`}
    >
      <div className='w-full gap-10 bg-dark-800 flex p-3 pb-1- xl:px-0 xl:pt-10 max-w-[1140px] justify-between duration-1000 items-center '>
        <Link href='/' className='flex select-none items-center gap-1 w-fit'>
          <Image
            width={100}
            height={100}
            src={dokmaiwithtext}
            alt='Dokmai Store'
            className='duration-700 hidden xl:block'
          />
          <Image
            width={60}
            height={60}
            src={dokmailogo}
            alt='Dokmai Store'
            className='duration-700 xl:hidden'
          />
        </Link>
        <div className='flex items-center justify-end gap-5'>
          <div className='flex justify-end items-center gap-3 font-aktivGroteskBold text-xs md:text-md'>
            <Link
              href='https://dokmaistore.mysellix.io'
              target='_blank'
              className='border-[1px] border-primary px-2 py-1'
            >
              Buy Now
            </Link>
            <Link
              href='https://lin.ee/Ovlixv5'
              target='_blank'
              className='text-dark-800 bg-primary flex px-2 py-1 items-center gap-2'
            >
              Chat To Order <FaLine className='text-2xl' />
            </Link>
            <MobileNav />
          </div>
        </div>
      </div>
      <div className='w-full gap-10 xl:flex justify-between max-w-[1140px] hidden duration-1000 items-center'>
        <div className='flex w-full justify-between items-center bg-dark-800/70 backdrop-blur p-2'>
          <div className=' w-full flex gap-5 justify-between items-center text-white'>
            {navButtons.map((nav, i) => (
              <Link
                href={nav.url}
                key={i}
                className={`text-light-200  border-b-[1px] border-primary flex-col-reverse py-[3px] hover:py-[1px] duration-300 px-[10px] rounded-sm md:text-sm font-medium group ${
                  path === nav.url
                    ? "font-black transition-transform duration-700 "
                    : ""
                }${path === nav.url ? " text-primary" : " hover:text-primary"}`}
              >
                {nav.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
