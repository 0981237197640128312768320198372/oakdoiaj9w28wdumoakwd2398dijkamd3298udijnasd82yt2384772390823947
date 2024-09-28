import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const SharingAccessWithoutTV = [
  {
    duration: "1 Day",
    price: 9,
    type: "Sharing Access Without TV",
  },
  {
    duration: "3 Days",
    price: 15,
    type: "Sharing Access Without TV",
  },
  {
    duration: "5 Days",
    price: 20,
    type: "Sharing Access Without TV",
  },
  {
    duration: "7 Days",
    price: 29,
    type: "Sharing Access Without TV",
  },
  {
    duration: "14 Days",
    price: 55,
    type: "Sharing Access Without TV",
  },
  {
    duration: "30 Days",
    price: 99,
    type: "Sharing Access Without TV",
  },
  {
    duration: "60 Days",
    price: 189,
    type: "Sharing Access Without TV",
  },
  {
    duration: "90 Days",
    price: 279,
    type: "Sharing Access Without TV",
  },
]

const SharingAccessWithTV = [
  {
    duration: "1 Day",
    price: 19,
    type: "Sharing Access With TV",
  },
  {
    duration: "3 Days",
    price: 29,
    type: "Sharing Access With TV",
  },
  {
    duration: "5 Days",
    price: 39,
    type: "Sharing Access With TV",
  },
  {
    duration: "7 Days",
    price: 49,
    type: "Sharing Access With TV",
  },
  {
    duration: "14 Days",
    price: 89,
    type: "Sharing Access With TV",
  },
  {
    duration: "30 Days",
    price: 149,
    type: "Sharing Access With TV",
  },
  {
    duration: "60 Days",
    price: 279,
    type: "Sharing Access With TV",
  },
  {
    duration: "90 Days",
    price: 409,
    type: "Sharing Access With TV",
  },
]

const FamilyAccessAnyDevices = [
  {
    duration: "7 Days",
    price: 149,
    type: "Family Access For Any Devices",
  },
  {
    duration: "14 Days",
    price: 299,
    type: "Family Access For Any Devices",
  },
  {
    duration: "30 Days",
    price: 599,
    type: "Family Access For Any Devices",
  },
  {
    duration: "60 Days",
    price: 1149,
    type: "Family Access For Any Devices",
  },
  {
    duration: "90 Days",
    price: 1599,
    type: "Family Access For Any Devices",
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

      <div className='flex flex-col gap-10 bg-red-500 w-full'>
        <Dialog>
          <DialogTrigger>
            <div className='flex flex-col justify-start items-start py-2 px-3 border-primary border-2 w-full'>
              <h6 className='font-mono'>asd</h6>
              <h2 className='flex items-center text-4xl font-extrabold font-sans'>
                ฿asd.00
              </h2>
              <p className='text-xs font-mono'>asd</p>
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
      </div>
    </div>
  )
}

export default page
