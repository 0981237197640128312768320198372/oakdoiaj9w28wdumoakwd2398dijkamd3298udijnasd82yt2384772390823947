"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import dokmailogo from "@/assets/images/dokmailogo.png"

import React, { useEffect, useState } from "react"

export const Features = ({
  text,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  text: {
    text: string
  }[]
  direction?: "left" | "right"
  speed?: "fast"
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
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "30s")
      }
    }
  }
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative w-screen overflow-hidden select-none",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          " flex w-max items-center gap-16 font-aktivGroteskMediumItalic",
          start && "animate-scroll ",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {text.map((item) => (
          <li
            className='w-fit flex justify-center items-center gap-2'
            key={item.text}
          >
            <Image
              src={dokmailogo}
              width={30}
              height={30}
              alt='dokmai 5 stars reviews'
              className='mb-5'
              loading='lazy'
            />
            <span className='text-xl mb-4 text-light-200 font-normal'>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
