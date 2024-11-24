/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useState, useEffect, useRef } from "react"
import { GrClose } from "react-icons/gr"

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
    <div className='fixed inset-0 z-[50] bg-dark-800/30 backdrop-blur flex items-center justify-center'>
      <div
        ref={announcementRef}
        className='w-[90%] md:w-[60%] h-[90%] md:h-[80%] flex flex-col overflow-hidden z-[100] relative mx-auto'
      >
        <div className='w-full flex h-fit justify-between items-start p-4'>
          <div className='bg-primary px-4 py-2 text-black text-2xl md:text-4xl'>
            Announcement
          </div>
        </div>
        <div className='flex-grow p-4 overflow-y-auto bg-dark-800 border-[1px] border-dark-500 rounded'>
          {/* Your announcement content here */}
          <p className='text-base md:text-lg'>
            This is an example announcement. It will reappear after the
            specified expiration period.
          </p>
        </div>
        <div className='p-4 flex justify-between items-center bg-dark-800 border-t-[1px] border-dark-500'>
          <label className='flex items-center gap-2 text-sm md:text-base'>
            <input
              type='checkbox'
              className='w-4 h-4'
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            I understand, don&apos;t show it again
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
