import type { Metadata } from "next";
import "../../styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Watch Series Now!",
  description: "watch series now website for payment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className='antialiased font-wsnfont'
      >
        <div className='relative'>
        <Navbar />
        <div className='flex'>
          <div className='flex min-h-screen flex-1 flex-col pt-24 '>
            <div className='mx-auto flex justify-between w-full p-10'>
              {children}
            </div>
          </div>
        </div>
        <Footer />
        {/* <div className='w-full h-2 fixed bottom-0 bg-green-500 sm:bg-yellow-500 md:bg-orange-500 lg:bg-red-500' /> */}
      </div>
      </body>
    </html>
  );
}

