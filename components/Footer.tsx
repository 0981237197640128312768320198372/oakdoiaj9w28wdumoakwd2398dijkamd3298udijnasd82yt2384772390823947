import Image from "next/image"
import React from "react"
import dokmaiwhitewithtext from "@/assets/images/dokmaiwhitewithtext.png"
import dokmaistorefooter from "@/assets/images/dokmaistorefooter.png"
import { MdAlternateEmail } from "react-icons/md"
import { FaInstagram } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"
import { FaFacebook } from "react-icons/fa"
import { FaLine } from "react-icons/fa6"
import Link from "next/link"
import { footerButton } from "@/constant"

const contact = [
  {
    icon: <MdAlternateEmail />,
    url: "mailto:support@dokmaistore.com",
  },
  {
    icon: <FaInstagram />,
    url: "https://instagram.com/dokmaistore",
  },
  {
    icon: <FaXTwitter />,
    url: "https://x.com/DokmaiStore",
  },
  {
    icon: <FaFacebook />,
    url: "https://www.facebook.com/dokmaistore01",
  },
  {
    icon: <FaLine />,
    url: "https://lin.ee/Ovlixv5",
  },
]

const Footer = () => {
  return (
    <footer className='flex justify-center items-center w-full z-50'>
      <div className='flex w-ful flex-col justify-center __container items-center px-0 '>
        <div className='flex w-full flex-col lg:justify-between lg:flex-row gap-5 bg-dark-600/30 py-5 mt-24 px-5'>
          <div className='flex flex-col gap-3'>
            <Image
              src={dokmaiwhitewithtext}
              alt='Footer Image - Dokmai Store'
              className='select-none'
              height={50}
              loading='lazy'
            />
            <p className='text-xs font-aktivGroteskLight select-none'>
              {/* <strong>Netflix Premium</strong> คุณภาพสูง ราคาถูก
              พร้อมรับประกันตลอดชีพจาก <br />
              <strong>Dokmai Store</strong> แพลตฟอร์มดิจิทัลชั้นนำของไทย
              <strong>บริการรวดเร็ว</strong> ดูหนังและซีรีส์ได้เต็มอิ่มทุกเวลา */}
              <strong>
                ยินดีต้อนรับสู่ดอกไม้สโตร์
                แพลตฟอร์มที่คุณไว้วางใจสำหรับบัญชีแอปพรีเมียม เช่น Netflix
                Premium, Amazon Prime Video
              </strong>
              <br />
              <strong>
                และบริการอื่นๆ อีกมากมาย เรามุ่งมั่นที่จะมอบบัญชีคุณภาพสูง
                พร้อมบริการลูกค้าที่เป็นเลิศและราคาที่คุ้มค่า
                เพื่อให้คุณได้รับประสบการณ์ที่ดีที่สุด
              </strong>
            </p>
          </div>
          <div className='flex font-aktivGroteskRegular text-xs justify-start xl:justify-end items-start gap-5 underline'>
            {footerButton.map((contact, i) => (
              <Link
                href={contact.url}
                target='_blank'
                key={i}
                className='flex items-center text-light-100 hover:text-primary '
              >
                {contact.title}
              </Link>
            ))}
          </div>
        </div>
        <div className='flex items-start md:items-center sm:flex-row flex-col-reverse justify-between xl:p-0 px-5 pt-5 w-full border-t-[1px] border-dark-500'>
          <p className='text-dark-100 font-aktivGroteskLight py-5 select-none'>
            Copyright 2022, Dokmai Store. All rights reserved.
          </p>
          <li className='flex gap-5 items-center'>
            <Link href='/admin' className='flex items-center p-4 '>
              {" "}
            </Link>
            {contact.map((contact, i) => (
              <Link
                href={contact.url}
                target='_blank'
                key={i}
                className='text-light-700 hover:text-light-100 text-2xl'
              >
                {contact.icon}
              </Link>
            ))}
          </li>
        </div>
        <Image
          src={dokmaistorefooter}
          alt='Footer Image - Dokmai Store'
          className='select-none'
          loading='lazy'
        />
      </div>
    </footer>
  )
}

export default Footer
