/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import React, { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"

export const TextHoverEffect = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" })

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect()
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      })
    }
  }, [cursor])

  return (
    <svg
      ref={svgRef}
      width='100%'
      height='100%'
      viewBox='0 0 300 100'
      xmlns='http://www.w3.org/2000/svg'
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className='select-none w-fit h-fit'
    >
      <defs>
        <linearGradient
          id='textGradient'
          gradientUnits='userSpaceOnUse'
          cx='50%'
          cy='50%'
          r='25%'
        >
          {hovered && (
            <>
              <stop offset='0%' stopColor={"var(--primary)"} />
              <stop offset='25%' stopColor={"var(--primary)"} />
              <stop offset='50%' stopColor={"var(--primary)"} />
              <stop offset='75%' stopColor={"var(--white)"} />
              <stop offset='100%' stopColor={"var(--primary)"} />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id='revealMask'
          gradientUnits='userSpaceOnUse'
          r='5%'
          animate={maskPosition}
          transition={{ duration: 1.5, ease: "easeOut" }}

          // example for a smoother animation below

          // transition={{
          //   type: "spring",
          //   stiffness: 700,
          //   damping: 100,
          // }}
        >
          <stop offset='0%' stopColor='white' />
          <stop offset='100%' stopColor='black' />
        </motion.radialGradient>
        <mask id='textMask'>
          <rect
            x='0'
            y='0'
            width='100%'
            height='100%'
            fill='url(#revealMask)'
          />
        </mask>
      </defs>
      <text
        x='50%'
        y='50%'
        textAnchor='middle'
        dominantBaseline='middle'
        strokeWidth='0.1'
        className='font-aktivGroteskBold stroke-dark-600 fill-transparent text-7xl flex flex-col gap-0'
        style={{ opacity: hovered ? 0.6 : 0 }}
      >
        <tspan dy='-60%'>DOKMAI</tspan>
        <tspan dy='60%' x='50%'>
          STORE
        </tspan>
      </text>
      <motion.text
        x='50%'
        y='50%'
        textAnchor='middle'
        dominantBaseline='middle'
        strokeWidth='0.1'
        className='font-aktivGroteskBold fill-transparent text-7xl  stroke-dark-600 flex flex-col gap-0'
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
      >
        <tspan dy='-60%'>DOKMAI</tspan>
        <tspan dy='60%' x='50%'>
          STORE
        </tspan>
      </motion.text>
      <text
        x='50%'
        y='50%'
        textAnchor='middle'
        dominantBaseline='middle'
        stroke='url(#textGradient)'
        strokeWidth='0.1'
        mask='url(#textMask)'
        className='font-aktivGroteskBold fill-transparent text-7xl flex flex-col items-start gap-0'
      >
        <tspan dy='-60%'>DOKMAI</tspan>
        <tspan dy='60%' x='50%'>
          STORE
        </tspan>
      </text>
    </svg>
  )
}
