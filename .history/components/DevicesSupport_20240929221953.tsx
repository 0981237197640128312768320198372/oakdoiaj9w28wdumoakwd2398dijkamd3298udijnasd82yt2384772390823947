/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"

import React, { useEffect, useState } from "react"

export const DevicesSupport = ({
  reviewsData,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  reviewsData: {
    title: string
    image: string
    description: string
  }[]
  direction?: "left" | "right"
  speed?: "slow"
  pauseOnHover?: boolean
  className?: string
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const scrollerRef = React.useRef<HTMLUListElement>(null)

  useEffect(() => {
    addAnimation()
  }, [])
  const [start, setStart] = useState(false)
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children)

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true)
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem)
        }
      })

      getDirection()
      getSpeed()
      setStart(true)
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        )
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        )
      }
    }
  }
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "slow") {
        containerRef.current.style.setProperty("--animation-duration", "300s")
      }
    }
  }
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative max-w-[1140px] overflow-hidden ",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          " flex min-w-full shrink-0 gap-4 py-2 w-max flex-nowrap",
          start && "animate-scroll ",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {reviewsData.map((item) => (
          <li
            className='w-[350px] max-w-full relative rounded-lg border flex-shrink-0 border-dark-500 p-8 md:w-[450px]'
            key={item.title}
          >
            <blockquote className='bh-full'>
              <Image
                src={item.image}
                width={100}
                height={100}
                alt='dokmai store feature, support any devices'
                className='mb-5'
              />
              <span className='relative text-xl mb-4 text-light-200 font-normal'>
                {item.title}
              </span>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  )
}
