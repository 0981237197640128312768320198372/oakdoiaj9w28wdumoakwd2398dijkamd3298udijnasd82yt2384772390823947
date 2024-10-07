import React from "react"
import { Recommendations } from "@/app/api/GoogleSheetAPI"
const page = async () => {
  const recommendationsData = await Recommendations()
  console.log(recommendationsData)
  return (
    <div className='flex justify-center items-center h-screen w-full text-light-100'>
      Coming soon
    </div>
  )
}

export default page
