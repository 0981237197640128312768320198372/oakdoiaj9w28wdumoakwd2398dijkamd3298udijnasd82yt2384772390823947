import Link from "next/link"
import React from "react"

const SubTitle = ({
  title = "Sub Title",
  buttonMore = "View More",
  urlButtonMore,
  className,
}: {
  title: string
  buttonMore?: string
  urlButtonMore?: string
  className?: string
}) => {
  return (
    <div
      className={`flex gap-7 w-full justify-between items-center p-5 xl:p-0 __container ${className}`}
    >
      <h3 className='flex justify-start items-center w-fit text-sm xl:text-lg font-aktivGroteskMedium md:whitespace-nowrap'>
        {title}
      </h3>
      <div className='w-full h-[1px] bg-light-200' />
      {buttonMore && urlButtonMore && (
        <Link
          className='flex w-fit justify-end text-xs xl:text-sm items-center border-b-[1px] border-light-200 flex-col-reverse py-[2px] hover:border-primary hover:text-primary duration-300 whitespace-nowrap '
          href={urlButtonMore}
        >
          {buttonMore}
        </Link>
      )}
    </div>
  )
}

export default SubTitle
