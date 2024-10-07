import PageHeadline from "@/components/PageHeadline"
import TermsAndConditions from "@/components/Terms"
import { Terms } from "@/constant"
import { generateMetadata } from "@/lib/utils"
import React from "react"

export const metadata = generateMetadata({
  title: "ข้อกำหนดและเงื่อนไข",
  description:
    "อ่านข้อกำหนดและเงื่อนไขการใช้งานของ Dokmai Store เพื่อเรียนรู้เกี่ยวกับนโยบายการชำระเงิน การใช้งานบัญชี และการให้บริการลูกค้า.",
  url: "https://www.dokmaistore.com/terms-and-conditions",
  keywords:
    "ข้อกำหนดและเงื่อนไข, Netflix Premium, Prime Video, Dokmai Store, บัญชีพรีเมียม, นโยบายการใช้งาน",
})

const page = () => {
  return (
    <div className='w-full px-5 xl:px-0 mt-40  __container'>
      <PageHeadline
        headline='Terms and Conditions'
        description='Welcome to Dokmai Store. These Terms and Conditions govern your use of our website and the purchase of our products. By accessing, browsing, or making a purchase on this site, you agree to comply with and be bound by the following terms. Please read these terms carefully before proceeding, as they constitute a legally binding agreement between you and Dokmai Store. If you do not agree to any part of these terms, you should refrain from using our services or purchasing any products from Dokmai Store.'
      />
      <TermsAndConditions terms={Terms} />
    </div>
  )
}

export default page
