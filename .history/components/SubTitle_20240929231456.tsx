import Link from "next/link"
import React from "react"

const SubTitle = ({
  title = "Sub Title",
  buttonMore = "View More",
  urlButtonMore = "View More",
  className,
}: {
  title: string
  buttonMore?: string
  urlButtonMore?: string
  className?: string
}) => {
  return (
    <div
      className={`flex gap-5 w-full justify-between items-center p-5 md:px-0 bg-red-500  __container ${className}`}
    >
      <h3 className='justify-start items-center w-full bg-blue-500 font-aktivGroteskMedium'>
        {title}
      </h3>
      <div className='w-full h-[1px] bg-light-800' />
      <Link
        className='flex w-fit justify-end items-center text-sm bg-yellow-400'
        href={urlButtonMore}
      >
        <span className='flex justify-end items-center w-full'></span>
        {buttonMore}
      </Link>
    </div>
  )
}

export default SubTitle
