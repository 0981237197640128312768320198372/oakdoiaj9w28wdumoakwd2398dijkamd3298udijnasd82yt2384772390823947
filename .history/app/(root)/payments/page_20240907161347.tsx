import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const paymentList = [
  {
    title: "1 Day Without TV",
    price: 9,
    description: "Sharing Access Without TV",
  },
  {
    title: "3 Days Without TV",
    price: 15,
    description: "Sharing Access Without TV",
  },
  {
    title: "5 Days Without TV",
    price: 20,
    description: "Sharing Access Without TV",
  },
  {
    title: "7 Days Without TV",
    price: 29,
    description: "Sharing Access Without TV",
  },
  {
    title: "14 Days Without TV",
    price: 55,
    description: "Sharing Access Without TV",
  },
  {
    title: "30 Days Without TV",
    price: 99,
    description: "Sharing Access Without TV",
  },
  {
    title: "60 Days Without TV",
    price: 189,
    description: "Sharing Access Without TV",
  },
  {
    title: "90 Days Without TV",
    price: 279,
    description: "Sharing Access Without TV",
  },
  {
    title: "1 Day With TV",
    price: 19,
    description: "Sharing Access With TV",
  },
  {
    title: "3 Days With TV",
    price: 29,
    description: "Sharing Access With TV",
  },
  {
    title: "5 Days With TV",
    price: 39,
    description: "Sharing Access With TV",
  },
  {
    title: "7 Days With TV",
    price: 49,
    description: "Sharing Access With TV",
  },
  {
    title: "14 Days With TV",
    price: 89,
    description: "Sharing Access With TV",
  },
  {
    title: "30 Days With TV",
    price: 149,
    description: "Sharing Access With TV",
  },
  {
    title: "60 Days With TV",
    price: 279,
    description: "Sharing Access With TV",
  },
  {
    title: "90 Days With TV",
    price: 409,
    description: "Sharing Access With TV",
  },
  {
    title: "7 Days Family Access",
    price: 149,
    description: "Family Access For Any Devices",
  },
  {
    title: "14 Days Family Access",
    price: 299,
    description: "Family Access For Any Devices",
  },
  {
    title: "30 Days Family Access",
    price: 599,
    description: "Family Access For Any Devices",
  },
  {
    title: "60 Days Family Access",
    price: 1149,
    description: "Family Access For Any Devices",
  },
  {
    title: "90 Days Family Access",
    price: 1599,
    description: "Family Access For Any Devices",
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

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
        {paymentList.map((list, i) => (
          <Dialog key={i}>
            <DialogTrigger>
              <div className='flex flex-col justify-start items-start py-2 px-3 border-primary border-2 w-fit'>
                <h6 className='font-mono'>{list.title}</h6>
                <h2 className='flex items-center text-4xl font-extrabold font-sans'>
                  ฿{list.price}.00
                </h2>
                <p className='text-xs font-mono'>{list.description}</p>
              </div>
            </DialogTrigger>
            <DialogContent className='bg-dark-800 border-primary border-2 rounded-none'>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}

export default page
