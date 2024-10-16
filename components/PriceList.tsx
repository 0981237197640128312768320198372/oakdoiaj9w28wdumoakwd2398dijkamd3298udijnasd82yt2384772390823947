/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import React from "react"

const PriceList = ({ priceData, name }: { priceData: any[]; name: string }) => {
  return (
    <div className='flex flex-col lg:flex-row w-full justify-between items-start gap-7 xl:px-0 px-5'>
      {priceData.map((price, i) => (
        <div
          className='flex w-full flex-col gap-3 rounded-lg border-[1px] border-dark-500 p-5'
          key={i}
        >
          {name}
          <span className='flex flex-col pb-5 mb-5'>
            <h2 className='text-light-100'>{price.type}</h2>
            <p className='text-light-400 text-xs'>{price.description}</p>
          </span>
          <div className='flex flex-col gap-3'>
            {price.plans.map((plan: any, i: any) => (
              <div key={i} className='pb-5'>
                <div className='flex w-full bg-dark-700 items-start justify-end'>
                  {plan.badge}
                </div>
                <div className='flex flex-col py-5 px-10 h-full gap-5 bg-dark-700'>
                  {plan.prices &&
                    plan.prices.length > 0 &&
                    plan.prices.map((price: any, i: any) => (
                      <div className='flex gap-3 items-center' key={i}>
                        <span className='px-2 text-xl bg-primary text-dark-800 font-aktivGroteskBold whitespace-nowrap'>
                          {price.duration}
                        </span>
                        <p className='text-xl whitespace-nowrap'>
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
  )
}

export default PriceList
