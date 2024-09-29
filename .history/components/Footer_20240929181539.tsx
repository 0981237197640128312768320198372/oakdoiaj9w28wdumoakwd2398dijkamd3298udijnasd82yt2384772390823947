import Image from "next/image"
import React from "react"
import dokmaistorefooter from "@/assets/images/dokmaistorefooter.png"
import { MdAlternateEmail } from "react-icons/md"
import { FaInstagram } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"
import { FaFacebook } from "react-icons/fa"
import { FaLine } from "react-icons/fa6"
import Link from "next/link"

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
    url: "https://facebook.com/watchseriesnow01",
  },
  {
    icon: <FaLine />,
    url: "https://lin.ee/Ovlixv5",
  },
]

const Footer = () => {
  return (
    <footer className='flex justify-center items-center w-full '>
      <div className='flex w-ful flex-col justify-center __container items-center py-3 border-t-[1px] border-dark-500'>
        <div className='flex justify-between items-start w-full'>
          <p className='text-dark-100 font-aktivGroteskLight py-5'>
            Copyright 2022, Dokmai Store. All rights reserved.
          </p>
          <li className='flex gap-5'>
            {contact.map((contact, i) => (
              <Link
                href={contact.url}
                key={i}
                className='text-dark-200 hover:text-light-200 text-2xl'
              >
                {contact.icon}
              </Link>
            ))}
          </li>
        </div>

        <Image
          src={dokmaistorefooter}
          alt='Footer Image - Dokmai Store'
          className='opacity-65'
        />
      </div>
    </footer>
  )
}

export default Footer
