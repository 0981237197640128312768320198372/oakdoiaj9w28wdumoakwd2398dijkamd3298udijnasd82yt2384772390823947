import React from "react"
import { primeVideoPrice } from "@/constant"
import SubTitle from "../SubTitle"
import PriceList from "../PriceList"
const PricingSection = () => {
  return (
    <section
      id='Pricing'
      className='flex flex-col w-full items-center py-5 pt-40 __container gap-20'
    >
      <SubTitle
        title='Products'
        buttonMore='View More Products'
        urlButtonMore='/prices'
        className=''
      />
      <PriceList name='Prime Video' priceData={primeVideoPrice} />
    </section>
  )
}

export default PricingSection
