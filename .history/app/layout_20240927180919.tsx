/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next"
import "../styles/globals.css"
import Navbar from "@/components/Navbar"
export const metadata: Metadata = {
  title: "High Quality Account Netflix Premium | Dokmai Store",
  description:
    "Digital Products Platform For Anyone who needs netflix premium cheap prices with high quality",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className='antialiased font-mono min-h-screen dark:bg-dark-800 bg-light-100 text-light-200'>
        <Navbar />
        <div className='flex flex-col justify-center items-center w-full p-10 h-screen'>
          {children}
        </div>
        <div className='w-full h-2 fixed bottom-0 bg-green-500 sm:bg-yellow-500 md:bg-orange-500 lg:bg-red-500' />
      </body>
    </html>
  )
}
