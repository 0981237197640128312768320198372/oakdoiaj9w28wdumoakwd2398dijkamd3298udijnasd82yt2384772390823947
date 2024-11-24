import { CreditsOrTestimonialsDataModels } from "@/app/api/GoogleSheetAPI"
import PageHeadline from "@/components/PageHeadline"
import PaginatedCredits from "@/components/PaginatedCredits"
import { generateMetadata } from "@/lib/utils"
import React from "react"

export const metadata = generateMetadata({
  title: "คำวิจารณ์จากลูกค้า",
  description:
    "อ่านคำวิจารณ์จากลูกค้าที่ไว้วางใจและซื้อบัญชีแอพพรีเมียมจาก Dokmai Store เช่น Netflix Premium และ Prime Video พร้อมรับบริการลูกค้าที่ดีที่สุด.",
  url: "https://www.dokmaistore.com/testimonials",
  keywords:
    "คำวิจารณ์จากลูกค้า, Netflix Premium, Prime Video, บัญชีพรีเมียม, Dokmai Store",
})

export default async function Page() {
  const rawDataCreditsOrTestimonials = await CreditsOrTestimonialsDataModels()
  const totalCredits = rawDataCreditsOrTestimonials.length

  return (
    <main className='flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-10 xl:pt-28 __container'>
      <PageHeadline
        headline='เครดิต'
        description={`ลูกค้าและตัวแทนหลายร้อยคนไว้วางใจและกลับมาซื้อกับเราอย่างต่อเนื่อง เราสามารถขายโปรไฟล์ได้มากกว่าหลายพันโปรไฟล์ และจนถึงตอนนี้เรามีรีวิวจากลูกค้ามากกว่า ${totalCredits} รีวิว`}
      />
      <PaginatedCredits />
    </main>
  )
}
