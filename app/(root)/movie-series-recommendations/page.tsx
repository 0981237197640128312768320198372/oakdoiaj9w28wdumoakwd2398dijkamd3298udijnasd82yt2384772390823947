import React from "react"
import PageHeadline from "@/components/PageHeadline"
import { Recommendations } from "@/app/api/GoogleSheetAPI"
import ShowRecommendations from "@/components/ShowRecommendations"
import { generateMetadata } from "@/lib/utils"

export const metadata = generateMetadata({
  title: "Latest Movie Recommendations",
  description:
    "Check out the latest movie recommendations from Dokmai Store. We recommend the best Netflix movies and series for you to enjoy!",
  url: "https://www.dokmaistore.com/movie-series-recommendations",
  keywords:
    "movie recommendations, netflix recommendations, top movies, dokmai store",
})

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
