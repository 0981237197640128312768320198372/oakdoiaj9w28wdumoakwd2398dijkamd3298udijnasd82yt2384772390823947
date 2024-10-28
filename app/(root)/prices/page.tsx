import PageHeadline from "@/components/PageHeadline"
import Image from "next/image"
import React from "react"
import netflixpremium from "@/assets/images/netflixpremiumuhd.png"
import amazonprimevideo from "@/assets/images/amazonprimevideo.png"
import { netflixPrice, primeVideoPrice } from "@/constant"
import { generateMetadata } from "@/lib/utils"
import PriceList from "@/components/PriceList"

export const metadata = generateMetadata({
  title: "ราคาสินค้า",
  description:
    "ตรวจสอบราคาบัญชีแอพพรีเมียมเช่น Netflix Premium และ Prime Video ที่ Dokmai Store พร้อมข้อเสนอสุดพิเศษสำหรับผู้ขายและลูกค้าทั่วไป.",
  url: "https://www.dokmaistore.com/prices",
  keywords:
    "ราคาสินค้า, Netflix Premium, Prime Video, บัญชีพรีเมียม, ราคาถูก, ข้อเสนอพิเศษ",
})

const page = () => {
  return (
    <main className='flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-20 xl:pt-40 __container'>
      <PageHeadline
        headline='Price List'
        description='รับชม Netflix Premium ในราคาสุดประหยัด แต่คุณภาพเต็มขั้น เลือกแพ็กเกจที่คุ้มค่าที่สุดสำหรับคุณ พร้อมใช้งานทันที'
      />
      <div className='flex flex-col w-full py-5 gap-10 justify-center items-center'>
        <div className='w-full flex items-center gap-10'>
          <Image
            src={netflixpremium}
            alt='High Quality Netflix Premium Cheap Price Dokmai Store'
            width={150}
            height={150}
            className='w-fit select-none'
            loading='lazy'
          />
          <div className='w-full h-[1px] bg-dark-500' />
        </div>
        <PriceList name='Netflix Premium' priceData={netflixPrice} />
      </div>
      <div className='w-full flex items-center gap-10 mt-20'>
        <Image
          src={amazonprimevideo}
          alt='High Quality Netflix Premium Cheap Price Dokmai Store'
          width={150}
          height={150}
          className='w-fit select-none'
          loading='lazy'
        />
        <div className='w-full h-[1px] bg-dark-500' />
      </div>
      <PriceList name='Prime Video' priceData={primeVideoPrice} />
    </main>
  )
}

export default page
