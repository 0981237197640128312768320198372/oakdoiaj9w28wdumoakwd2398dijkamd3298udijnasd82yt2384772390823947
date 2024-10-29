"use client"
import PageHeadline from "@/components/PageHeadline"
import { ProductsList } from "@/components/ProductsList"
import { ProductPrices } from "@/constant"
import CartModal from "@/components/CartModal"
import { useState } from "react"

// export const metadata = generateMetadata({
//   title: "สินค้า",
//   description:
//     "ตรวจสอบราคาบัญชีแอพพรีเมียมเช่น Netflix Premium และ Prime Video ที่ Dokmai Store พร้อมข้อเสนอสุดพิเศษสำหรับผู้ขายและลูกค้าทั่วไป.",
//   url: "https://www.dokmaistore.com/products",
//   keywords:
//     "สินค้า, Netflix Premium, Prime Video, บัญชีพรีเมียม, ราคาถูก, ข้อเสนอพิเศษ",
// })

const Page = () => {
  const [isCartOpen, setCartOpen] = useState(false)

  return (
    <main className='flex flex-col justify-center w-full items-center px-5 xl:px-0 pt-20 xl:pt-40 __container'>
      <PageHeadline
        headline='สินค้า'
        description='รับชม Netflix Premium ในราคาสุดประหยัด แต่คุณภาพเต็มขั้น เลือกแพ็กเกจที่คุ้มค่าที่สุดสำหรับคุณ พร้อมใช้งานทันที'
      />
      <div className='fixed bottom-0 px-10 pt-10 pb-5 w-full bg-dark-700/40 backdrop-blur h-fit flex justify-center items-center border-t-[1px] border-dark-500'>
        <button
          onClick={() => setCartOpen(true)}
          className='bg-primary text-dark-800 py-2 rounded font-aktivGroteskBold text-xl px-4 w-full max-w-lg'
        >
          View Cart
        </button>
      </div>

      <ProductsList priceData={ProductPrices} />
      <CartModal isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </main>
  )
}

export default Page
