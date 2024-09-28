/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next"
import "../styles/globals.css"
import Navbar from "@/components/Navbar"
export const metadata: Metadata = {
  title: "บัญชี Netflix Premium คุณภาพสูง | Dokmai Store",
  description:
    "แพลตฟอร์มสินค้าดิจิทัลที่ดีที่สุดในประเทศไทย สำหรับทุกคนที่ต้องการ Netflix Premium ราคาถูกและคุณภาพดี ที่ Dokmai Store เราเป็นผู้ขายอันดับหนึ่งในไทย พร้อมการันตีคุณภาพการใช้งานตลอดอายุการใช้งาน ด้วยบริการที่เชื่อถือได้ ตอบกลับลูกค้าอย่างรวดเร็วภายใน 10 นาที และไม่เกิน 24 ชั่วโมง พร้อมช่วยแก้ไขปัญหาทุกอย่างเพื่อให้คุณได้รับประสบการณ์การดูหนังและซีรีส์ที่ดีที่สุด",
  icons: {
    icon: "./favicon.ico",
    apple: "./apple-touch-icon.png",
  },
  keywords:
    "Netflix Premium, บัญชี Netflix, บริการสตรีมมิ่ง, ดูหนังออนไลน์, ดูซีรีส์, บัญชีราคาถูก, Dokmai Store, ซื้อ Netflix ราคาถูก, บัญชี Netflix ราคาถูก, บัญชี Netflix คุณภาพดี, บริการลูกค้าไว, สินค้าดิจิทัล",
  openGraph: {
    type: "website",
    url: "https://www.dokmaistore.com",
    title: "บัญชี Netflix Premium คุณภาพสูง | Dokmai Store",
    description:
      "แพลตฟอร์มสินค้าดิจิทัลที่ดีที่สุดในประเทศไทย สำหรับทุกคนที่ต้องการ Netflix Premium ราคาถูกและคุณภาพดีที่ Dokmai Store เราเป็นผู้ขายอันดับหนึ่งในไทย พร้อมการันตีคุณภาพการใช้งานตลอดอายุการใช้งาน ด้วยบริการที่เชื่อถือได้ ตอบกลับลูกค้าอย่างรวดเร็วภายใน 10 นาที และไม่เกิน 24 ชั่วโมง พร้อมช่วยแก้ไขปัญหาทุกอย่างเพื่อให้คุณได้รับประสบการณ์การดูหนังและซีรีส์ที่ดีที่สุด",
    images: [
      {
        url: "https://www.dokmaistore.com/og-dokmaistore.jpg",
        width: 1200,
        height: 630,
        alt: "Netflix Premium คุณภาพสูง ราคาถูก ที่ Dokmai Store",
      },
    ],
    siteName: "Dokmai Store",
  },
  twitter: {
    card: "summary_large_image",
    site: "@DokmaiStore",
    title: "บัญชี Netflix Premium คุณภาพสูง | Dokmai Store",
    description:
      "แพลตฟอร์มสินค้าดิจิทัลที่ดีที่สุดในประเทศไทย สำหรับทุกคนที่ต้องการ Netflix Premium ราคาถูกและคุณภาพดีที่ Dokmai Store เราเป็นผู้ขายอันดับหนึ่งในไทย พร้อมการันตีคุณภาพการใช้งานตลอดอายุการใช้งาน ด้วยบริการที่เชื่อถือได้ ตอบกลับลูกค้าอย่างรวดเร็วภายใน 10 นาที และไม่เกิน 24 ชั่วโมง พร้อมช่วยแก้ไขปัญหาทุกอย่างเพื่อให้คุณได้รับประสบการณ์การดูหนังและซีรีส์ที่ดีที่สุด",
    images: [
      {
        url: "https://www.dokmaistore.com/og-dokmaistore.jpg",
        alt: "Netflix Premium คุณภาพสูง ราคาถูก ที่ Dokmai Store",
      },
    ],
  },
  alternates: {
    canonical: "https://www.dokmaistore.com",
    languages: {
      "th-TH": "https://www.dokmaistore.com/th",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='!scroll-smooth'>
      <body className='antialiased font-mono min-h-screen bg-dark-800 text-light-200'>
        <Navbar />
        <div className='flex flex-col justify-start items-center w-full h-screen p-10 lg:px-60 pt-20 bg-primary'>
          {children}
        </div>
        <div className='w-full h-2 fixed bottom-0 bg-green-500 sm:bg-yellow-500 md:bg-orange-500 lg:bg-red-500' />
      </body>
    </html>
  )
}
