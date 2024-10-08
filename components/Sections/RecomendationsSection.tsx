import React from "react"
import SubTitle from "@/components/SubTitle"

const RecomendationsSection = async () => {
  return (
    <section id='Recommendations'>
      <SubTitle
        title='Our Recommendations'
        buttonMore='View More Recommendations'
        urlButtonMore={"/movie-series-recommendations"}
        className='mb-16'
      />
    </section>
  )
}

export default RecomendationsSection
