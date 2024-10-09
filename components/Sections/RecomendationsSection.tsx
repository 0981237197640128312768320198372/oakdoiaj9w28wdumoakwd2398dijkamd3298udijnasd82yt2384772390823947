import React from "react"
import SubTitle from "@/components/SubTitle"
import ShowRecommendations from "../ShowRecommendations"
import { Recommendations } from "@/app/api/GoogleSheetAPI"

const RecomendationsSection = async () => {
  const recommendationsData = await Recommendations()
  return (
    <section
      id='Recommendations'
      className='w-full __container mt-24 flex flex-col'
    >
      <SubTitle
        title='Our Recommendations'
        buttonMore='View More Recommendations'
        urlButtonMore={"/movie-series-recommendations"}
        className='mb-16'
      />
      <ShowRecommendations
        recomendations={recommendationsData}
        paginations={false}
        itemsperPage={2}
      />
    </section>
  )
}

export default RecomendationsSection
