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
        headline='ข้อตกลงและเงื่อนไข'
        description='ยินดีต้อนรับสู่ Dokmai Store ข้อตกลงและเงื่อนไขเหล่านี้จะกำหนดการใช้งานเว็บไซต์และการซื้อผลิตภัณฑ์ของเรา เมื่อคุณเข้าถึง ใช้งาน หรือซื้อสินค้า คุณตกลงที่จะปฏิบัติตามข้อกำหนดเหล่านี้อย่างสมบูรณ์ โปรดอ่านอย่างละเอียด หากคุณไม่ยอมรับเงื่อนไขใดๆ กรุณาหยุดใช้บริการหรือซื้อสินค้าใดๆ จาก Dokmai Store ทันที'
      />
      <TermsAndConditions terms={Terms} />
    </div>
  )
}

export default page
