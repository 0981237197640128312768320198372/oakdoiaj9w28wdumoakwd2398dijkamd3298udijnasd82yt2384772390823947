/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import Image from "next/image"
import React, { useState, useEffect, useRef } from "react"
import { GrClose } from "react-icons/gr"
import primevideo from "@/assets/images/amazonprimevideo.png"

const EXPIRATION_PERIOD = 2 * 60 * 60 * 1000

const AlertAnnouncement: React.FC = () => {
  const [isVisible, setIsVisible] = useState(() => {
    const lastDismissed = localStorage.getItem("announcementDismissedAt")
    if (!lastDismissed) return true
    return Date.now() - parseInt(lastDismissed, 10) > EXPIRATION_PERIOD
  })
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const announcementRef = useRef<HTMLDivElement>(null)

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("announcementDismissedAt", Date.now().toString())
    }
    setIsVisible(false)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      announcementRef.current &&
      !announcementRef.current.contains(event.target as Node)
    ) {
      handleClose()
    }
  }

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className='fixed inset-0 z-[50] bg-dark-800/30 backdrop-blur-lg flex items-center justify-center'>
      <div
        ref={announcementRef}
        className='w-[90%] md:w-[60%] h-[90%] md:h-[80%] flex flex-col overflow-hidden z-[100] relative mx-auto justify-center gap-10'
      >
        {/* <div className='w-full flex h-fit justify-between items-start'>
          <div className='bg-primary px-4 py-2 text-black text-2xl md:text-4xl font-aktivGroteskBold'>
            Promotion
          </div>
        </div> */}
        {/* <div className='flex-grow p-4 overflow-y-auto bg-gradient-to-tl from-light-100/15 from-10% via-light-100/20 via-30% to-light-100/30 to-90% backdrop-blur-3xl border-[1px] border-light-100/20 rounded-2xl '>
          <p className='text-base md:text-lg'>
            This is an example announcement. It will reappear after the
            specified expiration period.
          </p>
        </div> */}
        <Image src={primevideo} alt='Promotion Pop Up' className='' />
        <div className='flex justify-between items-center'>
          <label className='flex items-center gap-2 text-sm md:text-base'>
            <input
              type='checkbox'
              className='w-5 h-5 accent-primary'
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            เข้าใจแล้ว ไม่ต้องแสดงข้อความนี้อีก
          </label>
          <button
            onClick={handleClose}
            className='text-primary p-2 cursor-pointer rounded-full border-[1px] border-primary'
            aria-label='Close announcement'
          >
            <GrClose className='md:text-xl' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertAnnouncement
