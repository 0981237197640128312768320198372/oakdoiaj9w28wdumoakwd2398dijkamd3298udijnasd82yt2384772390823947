"use client"
import FAQButton from "@/components/FAQButton"
import PageHeadline from "@/components/PageHeadline"
import { faqs } from "@/constant"
import React from "react"

export default function Page() {
  return (
    <main className='flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-20 xl:pt-40 __container'>
      <PageHeadline
        headline='Frequently Asked Questions'
        description='คำถามที่พบบ่อย'
      />
      <div className='w-full px-5 xl:px-0 flex flex-col gap-3'>
        {faqs.map((faq, i) => (
          <FAQButton
            key={i}
            index={i}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
      </div>
    </main>
  )
}
