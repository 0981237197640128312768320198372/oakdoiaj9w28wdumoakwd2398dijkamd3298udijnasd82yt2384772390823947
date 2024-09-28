"use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import MobileNav from "./MobileNav"
import Image from "next/image"
import dokmaiwithtext from "@/assets/images/dokmaiwithtext.png"

const Navbar = () => {
  const navButtons = [
    {
      title: "Home",
      url: "/",
    },
    {
      title: "เครดิต",
      url: "/Testimonials",
    },
    {
      title: "Netflix News",
      url: "/what-is-on-netflix",
    },
  ]

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
      className={`fixed flex items-start justify-center top-0 left-0 w-full transition-transform duration-500 z-50 transform ${
        visible ? "translate-y-0" : "-translate-y-full"
      } z-10`}
    >
      <div className='w-full gap-10 bg-dark-800 py-1 flex px-6 justify-between duration-1000 items-center '>
        <Link href='/' className='flex select-none items-center gap-1 py-3'>
          <Image
            width={100}
            height={100}
            src={dokmaiwithtext}
            alt='Footer Picture'
            className='duration-700'
          />
        </Link>
        <div className='flex items-center justify-between gap-5 lg:gap-10'>
          <div className='max-md:hidden flex lg:text-md'>
            <div className='flex lg:gap-7 gap-5 items-center'>
              {navButtons.map((nav, i) => (
                <Link
                  href={nav.url}
                  key={i}
                  className={`text-light-200 flex-col-reverse py-[3px] px-[10px] rounded-sm md:text-sm font-medium group duration-200 ${
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
          <div className='h-10 w-[1px] bg-dark-500 md:hidden' />
          <div className='flex justify-center items-center gap-3 md:gap-5 lg:gap-5'>
            <MobileNav />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
