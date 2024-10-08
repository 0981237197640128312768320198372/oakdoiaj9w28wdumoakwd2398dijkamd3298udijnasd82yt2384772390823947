import React from "react"
import PageHeadline from "@/components/PageHeadline"
import RecommendationsList from "@/components/RecommendationsList"
import { Recommendations } from "@/app/api/GoogleSheetAPI"
const page = async () => {
  const recommendationsData = await Recommendations()
  return (
    <div className='flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-20 xl:pt-40 __container'>
      <PageHeadline
        headline='Our Recommendations'
        description='Movies and Series Recommendations by Dokmai Store'
      />

      <RecommendationsList recommendations={recommendationsData} />
    </div>
  )
}

export default page
