/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link"
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { div } from "framer-motion/client"

const paymentLinks = [
  {
    title: "3 Days",
    price: 20,
    description: "Sharing Access Without TV",
  },
  {
    title: "7 Days",
    price: 40,
    description: "Sharing Access With TV",
  },
  {
    title: "30 Days",
    price: 100,
    description: "Sharing Access With TV & Premium",
  },
  {
    title: "Unlimited",
    price: 200,
    description: "Sharing Access With TV & Premium & Netflix Plus",
  },
]

const page = () => {
  return (
    <div className='flex justify-center items-center flex-col gap-24'>
      <div className='flex flex-col items-start'>
        <h1 className='font-wsnfont text-5xl lg:text-7xl'>
          Choose duration you will pay
        </h1>
        <p className='font-mono text-sm'>
          After you pay it, dont forget to screenshot the receipt and sent it on
          line
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10'>
        {paymentLinks.map((link, index) =>(
<Dialog>
          <DialogTrigger>
            <div className='flex flex-col justify-between items-start py-2 px-3 border-primary border-2 '>
              <h6 className='font-mono'>{link.title}</h6>
              <h2 className='flex items-center text-4xl font-extrabold font-sans'>
                ฿{link.price}.00
              </h2>
              <p className='text-xs font-mono'>{link.description}</p>
            </div>
          </DialogTrigger>
          <DialogContent className='bg-dark-800 border-primary border-2 rounded-none'>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        )}}
        
      </div>
    </div>
  )
}

export default page
