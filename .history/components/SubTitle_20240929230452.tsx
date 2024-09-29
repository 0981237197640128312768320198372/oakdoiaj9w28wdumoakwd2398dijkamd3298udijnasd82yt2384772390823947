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
    <div className={`flex justify-between items-center  ${className}`}>
      <h3 className='flex justify-start items-center'>{title}</h3>
      <div className='w-full h-[1px] bg-light-800' />
      <Link href={urlButtonMore}>{buttonMore}</Link>
    </div>
  )
}

export default SubTitle
