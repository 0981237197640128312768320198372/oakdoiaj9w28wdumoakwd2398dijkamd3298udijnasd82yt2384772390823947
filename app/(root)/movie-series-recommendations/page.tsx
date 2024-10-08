import React from "react"
import { Recommendations } from "@/app/api/GoogleSheetAPI"
import ShowRecommendations from "@/components/ShowRecommendations"
import PageHeadline from "@/components/PageHeadline"
const page = async () => {
  const recommendationsData = await Recommendations()
  return (
    <div className='flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-20 xl:pt-40 __container'>
      <PageHeadline
        headline='Our Recommendations'
        description='Movies and Series Recommendations by Dokmai Store'
      />
      <ShowRecommendations
        recommendations={recommendationsData}
        paginations={true}
      />
    </div>
  )
}

export default page
