"use client"
import React, { useState } from "react"
import SubTitle from "@/components/SubTitle"

const faqs = [
  {
    question: "",
    answer: "",
  },
]

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index) // Toggle open/close
  }
  return (
    <section
      id='Frequently Asked Questionss'
      className='w-full __container mt-64 flex flex-col gap-28'
    >
      <SubTitle
        title='Frequently Question Asked'
        buttonMore='View More Questions'
        urlButtonMore='/faq'
        className=''
      />
      <div className='w-full px-5 xl:px-0 flex flex-col gap-3'>
        {faqs.map((faq, index) => (
          <div key={index} className='__nofocus'>
            <button
              onClick={() => toggleFAQ(index)}
              className='w-full text-left flex justify-between items-center py-4 __nofocus'
            >
              <span className='text-xl font-aktivGroteskRegular text-light-300 __nofocus'>
                {faq.question}
              </span>
              <span className='text-light-500 transition-all duration-700'>
                {activeIndex === index ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M12 4v16m8-8H4'
                    />
                  </svg>
                )}
              </span>
            </button>
            {activeIndex === index && (
              <div
                className={`pl-4 pb-4 text-light-600 transition-all duration-300 ease-in-out ${
                  activeIndex === index
                    ? "max-h-screen opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default FAQSection
