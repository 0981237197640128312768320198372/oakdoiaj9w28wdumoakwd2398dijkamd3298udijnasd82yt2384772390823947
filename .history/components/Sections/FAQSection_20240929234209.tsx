import React from "react"
import SubTitle from "@/components/SubTitle"

const FAQSection = () => {
  return (
    <div>
      <SubTitle
        title='Frequently Question Asked'
        buttonMore='View More Question'
        urlButtonMore='/faq'
        className='mt-60'
      />
    </div>
  )
}

export default FAQSection
