"use client"
import PageHeadline from "@/components/PageHeadline"
import { Timeline } from "@/components/Timeline"
import Image from "next/image"
import React from "react"
import { GiClick } from "react-icons/gi"
import { BsChatLeftTextFill, BsQrCodeScan } from "react-icons/bs"
import chooseplan from "@/assets/images/chooseplan.png"
import girlordering from "@/assets/images/girlordering.jpg"
import girlpaying from "@/assets/images/girlpaying.jpg"
import Link from "next/link"

const page = () => {
  const data = [
    {
      icon: <GiClick className='text-2xl text-light-500' />,
      title: "Choosing Plan",
      content: (
        <div>
          <p className='text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8'>
            เลือกแพ็กเกจที่ใช่สำหรับคุณ{" "}
            <Link href={"/prices"} target='__blank' className='text-primary'>
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
    {
      icon: <BsChatLeftTextFill className='text-2xl text-light-500' />,
      title: "Ordering",
      content: (
        <div>
          <p className='text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8'>
            แจ้งแพ็กเกจที่ลูกค้าต้องการใน{" "}
            <Link
              href={"https://lin.ee/Ovlixv5"}
              target='__blank'
              className='text-primary'
            >
              Line chat
            </Link>
          </p>
          <div className='flex w-full h-full gap-4'>
            <Image
              src={girlordering}
              alt='Dokmai Store Price List Netflix Premium Plan'
              width={500}
              height={500}
              className='rounded-lg'
            />
          </div>
        </div>
      ),
    },
    {
      icon: <BsQrCodeScan className='text-2xl text-light-500' />,
      title: "Paying",
      content: (
        <div>
          <p className='text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8'>
            ชำระเงินผ่านทาง QR หรือวิธีการอื่น
          </p>
          <div className='flex w-full h-full gap-4'>
            <Image
              src={girlpaying}
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
