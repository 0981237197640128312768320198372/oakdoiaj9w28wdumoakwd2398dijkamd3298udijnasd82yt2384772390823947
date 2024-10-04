import React from "react"
import ShowTesti from "../ShowTesti"
import { CreditsOrTestimonialsDataModels } from "@/app/api/GoogleSheetAPI"
import SubTitle from "../SubTitle"

const CreditsSection = async () => {
  const rawDataCreditsOrTestimonials = await CreditsOrTestimonialsDataModels()
  return (
    <section id='Testimonials' className='mt-24'>
      <SubTitle
        title='Credits'
        buttonMore='View More Credits'
        urlButtonMore={"/testimonials"}
        className='mb-16'
      />
      <ShowTesti
        testimonials={rawDataCreditsOrTestimonials}
        paginations={false}
      />
    </section>
  )
}

export default CreditsSection
