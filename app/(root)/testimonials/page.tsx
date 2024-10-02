/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreditsOrTestimonialsDataModels } from "@/app/api/GoogleSheetAPI"
import ShowTesti from "@/components/ShowTesti"
import React from "react"
export default async function Page() {
  const rawDataCreditsOrTestimonials = await CreditsOrTestimonialsDataModels()
  console.log("")
  console.log("")
  console.log("================================")
  console.log("TESTIMONIALS DATA LOADED. \nEXAMPLE :")
  console.log(rawDataCreditsOrTestimonials[0].imageUrl)
  console.log("================================")
  console.log("")
  console.log("")

  return (
    <main className='flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-20 xl:pt-32 __container'>
      <div className='flex pb-16 flex-col justify-start w-full '>
        <strong className='font-aktivGroteskBold text-6xl '>เครดิต</strong>
        <p className='text-light-300'>
          ลูกค้ามากกว่า 50 คนไว้วางใจและกลับมาซื้อซ้ำกับเราอย่างต่อเนื่อง
          โดยมีการขายสำเร็จไปแล้วกว่า 230 โปรไฟล์
        </p>
      </div>
      <ShowTesti testimonials={rawDataCreditsOrTestimonials} />
    </main>
  )
}
