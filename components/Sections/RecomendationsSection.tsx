import React from "react"
import SubTitle from "@/components/SubTitle"
import ShowRecommendations from "../ShowRecommendations"
import { Recommendations } from "@/app/api/GoogleSheetAPI"

const RecomendationsSection = async () => {
  const recommendationsData = await Recommendations()
  return (
    <section id='Recommendations'>
      <SubTitle
        title='Our Recommendations'
        buttonMore='View More Recommendations'
        urlButtonMore={"/movie-series-recommendations"}
        className='mb-16'
      />
      <ShowRecommendations recommendations={recommendationsData} />
    </section>
  )
}

export default RecomendationsSection
