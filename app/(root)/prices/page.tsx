import PageHeadline from "@/components/PageHeadline"
import Image from "next/image"
import React from "react"
import netflixpremium from "@/assets/images/netflixpremiumuhd.png"
import amazonprimevideo from "@/assets/images/amazonprimevideo.png"
import { pricingPlans } from "@/constant"
import Link from "next/link"
import { generateMetadata } from "@/lib/utils"

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
            width={300}
            height={300}
            className='w-fit select-none'
          />
          <div className='w-full h-[1px] bg-dark-500' />
        </div>
        <div className='flex flex-col lg:flex-row w-fit justify-between items-start gap-7'>
          {pricingPlans.map((price, i) => (
            <div
              className='flex w-full flex-col gap-3 rounded-lg border-[1px] border-dark-500 p-5'
              key={i}
            >
              <span className='flex flex-col pb-5 mb-5'>
                <h2 className='text-light-100 font-aktivGroteskBold'>
                  {price.type}
                </h2>
                <p className='text-light-400 text-xs'>{price.description}</p>
              </span>
              <div className='flex flex-col gap-3'>
                {price.plans.map((plan, i) => (
                  <div key={i} className='pb-5'>
                    <div className='flex w-full bg-dark-700 items-start justify-end'>
                      {plan.badge}
                    </div>
                    <div className='flex flex-col py-5 px-10 h-full gap-5 bg-dark-700'>
                      {plan.prices &&
                        plan.prices.length > 0 &&
                        plan.prices.map((price, i) => (
                          <div className='flex gap-3 items-center' key={i}>
                            <span className='px-2 text-xl bg-primary text-dark-800 font-aktivGroteskBold whitespace-nowrap'>
                              {price.duration}
                            </span>
                            <p className='text-xl  whitespace-nowrap'>
                              ฿ {price.price}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href={"https://lin.ee/Ovlixv5"}
                target='_blank'
                className='w-full py-3 text-center hover:text-dark-700 hover:bg-primary border-primary border-[1px] mt-5 text-lg rounded-md font-aktivGroteskBold'
              >
                Order Now
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className='w-full flex items-center gap-10 mt-20'>
        <Image
          src={amazonprimevideo}
          alt='High Quality Netflix Premium Cheap Price Dokmai Store'
          width={150}
          height={150}
          className='w-fit select-none opacity-50'
        />
        <div className='w-full h-[1px] bg-dark-500' />
        <span className='whitespace-nowrap'>Coming Soon!</span>
      </div>
    </main>
  )
}

export default page
