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
      className={`flex gap-7 w-full justify-between items-center p-5 lg:p-0 __container ${className}`}
    >
      <h3 className='justify-start items-center w-fit font-aktivGroteskMedium lg:whitespace-nowrap'>
        {title}
      </h3>
      <div className='w-full h-[1px] bg-light-800' />
      <Link
        className='flex w-fit justify-end items-center text-sm lg:whitespace-nowrap'
        href={urlButtonMore}
      >
        {buttonMore}
      </Link>
    </div>
  )
}

export default SubTitle
