import React from "react"

const SubTitle = ({
  Title = "Sub Title",
  buttonMore = "View More",
  className,
}: {
  Title: string
  buttonMore: string
  className?: string
}) => {
  return (
    <div className={`flex justify-between items-center  ${className}`}>
      <h3 className='flex justify-start items-center'>{Title}</h3>
      <div className='w-full h-[1px] bg-light-800' />
    </div>
  )
}

export default SubTitle
