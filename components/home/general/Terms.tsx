import React from "react"

interface Term {
  title: string
  description: string
}

const TermsAndConditions = ({ terms }: { terms: Term[] }) => {
  return (
    <div className='flex flex-col justify-center w-full px-0 __container'>
      {terms.map((term, index) => (
        <div key={index}>
          <h2 className='font-aktivGroteskBold text-2xl text-light-100 mb-6'>
            {term.title}
          </h2>
          <p className='text-light-400 textsm mb-6'>{term.description}</p>
        </div>
      ))}
    </div>
  )
}

export default TermsAndConditions
