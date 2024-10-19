"use client"
import React, { useState } from "react"
import { GrAnnounce } from "react-icons/gr"

const AlertAnnouncement: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true)

  const handleClick = () => {
    setIsVisible(false)
  }

  return (
    <>
      {isVisible && (
        <div
          onClick={handleClick}
          className='fixed inset-0 z-[9999999999999] bg-black/50 backdrop-blur text-white flex items-center justify-center text-lg cursor-pointer'
        >
          <div className='h-5/6 w-full __container bg-dark-500 rounded-xl flex flex-col overflow-hidden'>
            <div className='w-full flex h-fit justify-between items-start '>
              <p className='bg-primary px-6 py-3 text-black text-4xl '>
                Announcement
              </p>
              <span className='text-primary p-6'>
                <GrAnnounce className='text-5xl' />
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AlertAnnouncement
