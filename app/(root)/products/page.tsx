import PageHeadline from "@/components/PageHeadline"
import ShowProducts from "@/components/ShowProducts"
import { generateMetadata } from "@/lib/utils"

export const metadata = generateMetadata({
  title: "สินค้า",
  description:
    "ตรวจสอบราคาบัญชีแอพพรีเมียมเช่น Netflix Premium และ Prime Video ที่ Dokmai Store พร้อมข้อเสนอสุดพิเศษสำหรับผู้ขายและลูกค้าทั่วไป.",
  url: "https://www.dokmaistore.com/products",
  keywords:
    "สินค้า, Netflix Premium, Prime Video, บัญชีพรีเมียม, ราคาถูก, ข้อเสนอพิเศษ",
})

const Page = () => {
  return (
    <main className='flex flex-col justify-center w-full items-center px-5 xl:px-0 pt-20 xl:pt-40 __container'>
      <PageHeadline
        headline='สินค้า'
        description='รับชม Netflix Premium ในราคาสุดประหยัด แต่คุณภาพเต็มขั้น เลือกแพ็กเกจที่คุ้มค่าที่สุดสำหรับคุณ พร้อมใช้งานทันที'
      />
      <ShowProducts />
    </main>
  )
}

export default Page
