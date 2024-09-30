import React from "react"
import SubTitle from "@/components/SubTitle"

const FAQSection = () => {
  return (
    <section id='Frequently Asked Questionss' className='__container'>
      <SubTitle
        title='Frequently Question Asked'
        buttonMore='View More Question'
        urlButtonMore='/faq'
        className='mt-60'
      />
    </section>
  )
}

export default FAQSection
