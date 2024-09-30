import React from "react"
import SubTitle from "@/components/SubTitle"

const FAQSection = () => {
  return (
    <section
      id='Frequently Asked Questionss'
      className='w-full __container mt-64'
    >
      <SubTitle
        title='Frequently Question Asked'
        buttonMore='View More Questions'
        urlButtonMore='/faq'
        className=''
      />
    </section>
  )
}

export default FAQSection
