"use client"
import React, { useState } from "react"
import SubTitle from "@/components/SubTitle"

const faqs = [
  {
    question: "What is TailwindCSS?",
    answer:
      "TailwindCSS is a utility-first CSS framework that provides low-level CSS classes for custom UI design.",
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
      className='w-full __container mt-64'
    >
      <SubTitle
        title='Frequently Question Asked'
        buttonMore='View More Questions'
        urlButtonMore='/faq'
        className=''
      />
      <div>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className='border-b-2 border-gray-200 __nofocus bg-red-500'
          >
            <button
              onClick={() => toggleFAQ(index)}
              className='w-full text-left flex justify-between items-center py-4 __nofocus'
            >
              <span className='text-xl font-semibold text-gray-800 __nofocus'>
                {faq.question}
              </span>
              <span className='text-gray-500'>
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
              <div className='pl-4 pb-4 text-gray-600'>{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default FAQSection
