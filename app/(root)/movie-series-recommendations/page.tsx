import React from "react"
import PageHeadline from "@/components/PageHeadline"
import { Recommendations } from "@/app/api/GoogleSheetAPI"
import ShowRecommendations from "@/components/ShowRecommendations"
const page = async () => {
  const recommendationsData = await Recommendations()
  return (
    <div className='flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-20 xl:pt-40 __container'>
      <PageHeadline
        headline='Our Recommendations'
        description='Movies and Series Recommendations by Dokmai Store'
      />
      <ShowRecommendations
        recomendations={recommendationsData}
        paginations={true}
      />
    </div>
  )
}

export default page
