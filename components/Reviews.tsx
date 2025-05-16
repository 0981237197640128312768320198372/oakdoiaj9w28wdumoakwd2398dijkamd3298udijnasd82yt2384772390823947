'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import fivestars from '@/assets/images/5stars.svg';

import React, { useEffect, useState } from 'react';

export const Reviews = ({
  reviewsData,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className,
}: {
  reviewsData: {
    title: string;
    review: string;
    name: string;
    date: string;
  }[];
  direction?: 'left' | 'right';
  speed?: 'fast' | 'normal' | 'slow';
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  });
  const [start, setStart] = useState(false);
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === 'left') {
        containerRef.current.style.setProperty('--animation-direction', 'forwards');
      } else {
        containerRef.current.style.setProperty('--animation-direction', 'reverse');
      }
    }
  };
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === 'fast') {
        containerRef.current.style.setProperty('--animation-duration', '20s');
      } else if (speed === 'normal') {
        containerRef.current.style.setProperty('--animation-duration', '40s');
      } else {
        containerRef.current.style.setProperty('--animation-duration', '500s');
      }
    }
  };
  return (
    <div
      ref={containerRef}
      className={cn(
        'scroller relative max-w-[1140px] overflow-hidden border-x-[1px] pb-1 border-dark-500 ',
        className
      )}>
      <ul
        ref={scrollerRef}
        className={cn(
          ' flex min-w-full shrink-0 gap-5 py-2 w-max flex-nowrap',
          start && 'animate-scroll ',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}>
        {reviewsData.map((item) => (
          <li
            className="w-[350px] max-w-full relative rounded-lg border flex-shrink-0 border-dark-500 p-8 md:w-[450px]"
            key={item.name}>
            <blockquote className="h-full">
              <Image
                src={fivestars}
                width={100}
                height={100}
                loading="lazy"
                alt="dokmai 5 stars reviews"
                className="mb-5"
              />
              <span className="relative text-xl mb-4 text-light-200 font-normal">{item.title}</span>
              <div className="relative h-full flex flex-row items-start text-light-600 pt-3">
                <span className="flex flex-col gap-1">
                  <span className=" text-sm leading-[1.6] text-gray-400 font-normal">
                    {item.name}
                  </span>
                  <span className=" text-sm leading-[1.6] text-gray-400 font-normal">
                    {item.review}
                  </span>
                  <span className=" text-sm leading-[1.6] text-gray-400 font-normal">
                    {item.date}
                  </span>
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};
