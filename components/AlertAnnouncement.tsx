/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useState, useEffect, useRef } from "react"
import { GrClose } from "react-icons/gr"

const AlertAnnouncement: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true)
  const announcementRef = useRef<HTMLDivElement>(null)

  const handleClose = () => {
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
  })

  if (!isVisible) return null // Early return if the announcement is not visible

  return (
    <div className='fixed inset-0 z-[50] bg-black/50 backdrop-blur flex items-center justify-center'>
      <div
        ref={announcementRef}
        className='w-[90%] md:w-[60%] h-[90%] md:h-[80%] bg-dark-500 rounded-xl flex flex-col overflow-hidden z-[100] relative mx-auto'
      >
        <div className='w-full flex h-fit justify-between items-start p-4'>
          <div className='bg-primary px-4 py-2 text-black text-2xl md:text-4xl'>
            Announcement
          </div>
          <button
            onClick={handleClose}
            className='text-primary p-4 cursor-pointer'
            aria-label='Close announcement'
          >
            <GrClose className='text-3xl md:text-5xl' />
          </button>
        </div>
        <div className='flex-grow p-4 overflow-y-auto'>
          {/* Your announcement content here */}
          <p className='text-base md:text-lg'>
            This is an example announcement. It should be responsive and look
            good on all devices!
          </p>
        </div>
      </div>
    </div>
  )
}

export default AlertAnnouncement
