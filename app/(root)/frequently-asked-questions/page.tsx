import FAQList from "@/components/FAQList"
import PageHeadline from "@/components/PageHeadline"
import { faqs } from "@/constant"
import { generateMetadata } from "@/lib/utils"
import React from "react"

export const metadata = generateMetadata({
  title: "คำถามที่พบบ่อย",
  description:
    "หากคุณมีคำถามเกี่ยวกับ Dokmai Store หรือบริการของเรา เช่น Netflix Premium, Prime Video และบัญชีแอพพรีเมียมอื่น ๆ อ่านคำถามที่พบบ่อยเพื่อเรียนรู้เพิ่มเติม.",
  url: "https://www.dokmaistore.com/frequently-asked-questions",
  keywords:
    "คำถามที่พบบ่อย, Netflix Premium, Prime Video, บัญชีพรีเมียม, Dokmai Store",
})

export default function Page() {
  return (
    <main className='flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-20 xl:pt-40 __container'>
      <PageHeadline
        headline='Frequently Asked Questions'
        description='คำถามที่พบบ่อย'
      />
      <div className='w-full px-5 xl:px-0 flex flex-col gap-3'>
        <FAQList faqs={faqs} />
      </div>
    </main>
  )
}
