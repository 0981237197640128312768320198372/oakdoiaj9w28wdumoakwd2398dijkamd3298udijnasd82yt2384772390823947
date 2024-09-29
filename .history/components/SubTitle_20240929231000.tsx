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
      className={`flex gap-5 justify-between bg-red-500 items-center py-5 w-screen __container ${className}`}
    >
      <h3 className='flex justify-start items-center w-full font-aktivGroteskMedium'>
        {title}
      </h3>
      <div className='w-full h-[1px] bg-light-800' />
      <Link
        className='w-full flex justify-end items-center bg-blue-500 text-sm'
        href={urlButtonMore}
      >
        {buttonMore}
      </Link>
    </div>
  )
}

export default SubTitle
