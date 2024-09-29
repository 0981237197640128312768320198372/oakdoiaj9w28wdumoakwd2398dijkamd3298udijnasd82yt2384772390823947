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
    <div className='flex justify-between items-center'>
      <h3></h3>
    </div>
  )
}

export default SubTitle
