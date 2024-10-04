"use client"
import PageHeadline from "@/components/PageHeadline"
import { Timeline } from "@/components/Timeline"
import Image from "next/image"
import React from "react"
import { GiClick } from "react-icons/gi"
import chooseplan from "@/assets/images/chooseplan.png"
import Link from "next/link"

const page = () => {
  const data = [
    {
      icon: <GiClick className='text-2xl text-light-500' />,
      title: "Choose Plan",
      content: (
        <div>
          <p className='text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8'>
            เลือกแพ็กเกจที่ใช่สำหรับคุณ{" "}
            <Link href={"/prices"} className='text-primary'>
              คลิกที่นี่
            </Link>
            เพื่อดูราคา
          </p>
          <div className='flex w-full h-full gap-4'>
            <Image
              src={chooseplan}
              alt='Dokmai Store Price List Netflix Premium Plan'
              width={500}
              height={500}
              className='rounded-lg'
            />
          </div>
        </div>
      ),
    },
  ]
  return (
    <div className='w-full mt-40 px-5 xl:px-0 __container'>
      <PageHeadline
        headline='How To Order'
        description='รับชม Netflix Premium ในราคาสุดประหยัด แต่คุณภาพเต็มขั้น เลือกแพ็กเกจที่คุ้มค่าที่สุดสำหรับคุณ พร้อมใช้งานทันที'
      />
      <Timeline data={data} />
    </div>
  )
}

export default page
