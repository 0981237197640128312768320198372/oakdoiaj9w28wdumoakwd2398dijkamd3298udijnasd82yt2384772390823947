import React from "react"
import PageHeadline from "@/components/PageHeadline"
const page = async () => {
  return (
    <div className='flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-20 xl:pt-40 __container'>
      <PageHeadline
        headline='Our Recommendations'
        description='Movies and Series Recommendations by Dokmai Store'
      />
    </div>
  )
}

export default page
