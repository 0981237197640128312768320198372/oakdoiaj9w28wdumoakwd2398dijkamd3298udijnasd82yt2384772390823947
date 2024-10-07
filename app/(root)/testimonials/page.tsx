import { CreditsOrTestimonialsDataModels } from "@/app/api/GoogleSheetAPI"
import PageHeadline from "@/components/PageHeadline"
import ShowTesti from "@/components/ShowTesti"
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

  return (
    <main className='flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-20 xl:pt-40 __container'>
      <PageHeadline
        headline='เครดิต'
        description='ลูกค้ามากกว่า 50 คนไว้วางใจและกลับมาซื้อซ้ำกับเราอย่างต่อเนื่อง
          โดยมีการขายสำเร็จไปแล้วกว่า 230 โปรไฟล์'
      />
      <ShowTesti
        testimonials={rawDataCreditsOrTestimonials}
        paginations={true}
      />
    </main>
  )
}
