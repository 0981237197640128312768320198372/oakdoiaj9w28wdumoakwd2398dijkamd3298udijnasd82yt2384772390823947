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
    <main className='flex flex-col justify-center w-full items-center px-5 xl:px-0 pt-10 xl:pt-28 __container'>
      <ShowProducts />
    </main>
  )
}

export default Page
