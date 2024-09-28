import { contactsButton, menuFooter } from "@/constant"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import wsnoutline from "@/assets/images/wsnoutline.png"
import wsnoutlinelong from "@/assets/images/wsnoutlinelong.png"

const Footer = () => {
  return (
    <footer className='flex justify-center items-center w-full px-10 lg:px-32 border-t-[1px] border-black/30 dark:border-white/30 bg-gray-100 dark:bg-dark-600 drop-shadow-md'>
      <div className='flex w-full justify-between items-center flex-col md:flex-row lg:flex-row gap-2 py-3'>
        <div className='flex flex-col lg:flex-row w-full h-full items-center justify-center lg:justify-between '>
          <div className='flex flex-col items-center'>
            <Link href='/' className='flex items-center h-full justify-start'>
              <Image
                width={500}
                height={500}
                src={wsnoutlinelong}
                alt='Footer Picture'
                className='duration-700 h-full'
              />
            </Link>
            <div className='flex gap-2 justify-end'>
              {contactsButton.map((cont) => (
                <Link
                  href={cont.url}
                  className='p-3 opacity-70 hover:bg-primary/20 dark:hover:bg-primary/20 rounded-md group'
                  key={cont.url}
                  target='_blank'
                >
                  {cont.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
