// components/PageHeadline.tsx
import React from "react"

interface PageHeadlineProps {
  headline: string
  description: string
}

const PageHeadline: React.FC<PageHeadlineProps> = ({
  headline,
  description,
}) => {
  return (
    <div className='flex pb-32 mb-8 flex-col gap-1 justify-start w-full border-b-[1px] border-dark-500'>
      <h1 className='font-aktivGroteskBold text-6xl'>{headline}</h1>
      <p className='text-light-300 text-sm font-aktivGroteskThin'>
        {description}
      </p>
    </div>
  )
}

export default PageHeadline
