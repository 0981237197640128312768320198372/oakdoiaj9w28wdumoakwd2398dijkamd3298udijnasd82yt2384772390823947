/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { useScroll, useTransform, motion } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"

interface TimelineEntry {
  step: string
  icon?: React.ReactNode
  content: React.ReactNode
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setHeight(rect.height)
    }
  }, [ref])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  return (
    <div className='w-full font-aktivGroteskRegular' ref={containerRef}>
      <div ref={ref} className='relative __container'>
        {data.map((item, index) => (
          <div
            key={index}
            className='flex justify-start pt-10 md:pt-40 md:gap-10'
          >
            <div className='sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full'>
              <div className='h-12 absolute left-3 md:left-3 w-10 rounded-full bg-dark-700 flex items-center justify-center'>
                <h3 className='px-2 py-1 rounded-md font-aktivGroteskBold bg-dark-400/50 text-light-400/70 flex items-center justify-center'>
                  {index + 1}
                </h3>
              </div>
              <h3 className='hidden md:block text-xl md:pl-24 md:text-4xl font-bold text-light-100 '>
                {item.step}
              </h3>
            </div>
            <div className='relative pl-20 pr-4 md:pl-4 w-full gap-10'>
              <h3 className='md:hidden block text-2xl font-aktivGroteskBold mb-4 text-left font-bold text-light-100 mt-10'>
                {item.step}
              </h3>
              {item.content}{" "}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className='absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] '
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className='absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-light-100 via-primary to-transparent from-[0%] via-[5%] rounded-full'
          />
        </div>
      </div>
    </div>
  )
}
