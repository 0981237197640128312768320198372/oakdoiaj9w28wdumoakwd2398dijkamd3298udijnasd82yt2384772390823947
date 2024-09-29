/* eslint-disable @typescript-eslint/no-unused-vars */
import HeroSection from "@/components/HeroSection"
import { DOKMAI } from "@/components/ui/DOKMAI"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import { Reviews } from "@/components/ui/Reviews"
import { FiveStarsReview, FiveStarsReview2 } from "@/constant"
import React, { useEffect, useState } from "react"

const testimonials = [
  {
    quote:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
    name: "Charles Dickens",
    title: "A Tale of Two Cities",
  },
  {
    quote:
      "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.",
    name: "William Shakespeare",
    title: "Hamlet",
  },
  {
    quote: "All that we see or seem is but a dream within a dream.",
    name: "Edgar Allan Poe",
    title: "A Dream Within a Dream",
  },
  {
    quote:
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    name: "Jane Austen",
    title: "Pride and Prejudice",
  },
  {
    quote:
      "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
    name: "Herman Melville",
    title: "Moby-Dick",
  },
]

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center'>
      <div className='flex justify-center items-center pt-24'>
        <DOKMAI text='DOKMAI' />
      </div>
      <HeroSection />
      <div className='h-[40rem] rounded-md flex flex-col antialiase dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden'>
        <Reviews reviewsData={FiveStarsReview} direction='right' speed='slow' />
        <Reviews reviewsData={FiveStarsReview2} direction='left' speed='slow' />
        <div className='h-[40rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden'>
          <InfiniteMovingCards
            items={testimonials}
            direction='right'
            speed='slow'
          />
        </div>
      </div>
    </main>
  )
}
