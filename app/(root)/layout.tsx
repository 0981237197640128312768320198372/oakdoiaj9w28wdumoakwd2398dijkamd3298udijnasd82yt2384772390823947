/* eslint-disable @next/next/next-script-for-ga */
/* eslint-disable @typescript-eslint/no-unused-vars */
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';
import { CartProvider } from '@/context/CartContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-X6ZTVB6G8L"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-X6ZTVB6G8L');
            `,
          }}
        />
      </head>
      <body className="font-aktivGroteskRegular min-h-screen bg-dark-800 text-light-200 overflow-x-hidden selection:bg-primary/10 selection:text-primary">
        <CartProvider>
          <Navbar />
          <div className="flex flex-col justify-start items-center w-full min-h-screen py-10 pt-20">
            {children}

            <Analytics />
          </div>
          <Footer />
        </CartProvider>

        {/* <div className='w-full font-aktivGroteskBold h-5 fixed bottom-0 flex justify-center items-center bg-cyan-500 sm:bg-blue-500 md:bg-green-500 lg:bg-yellow-500 xl:bg-orange-500 2xl:bg-red-500 '>
          <p className='hidden sm:block md:hidden'>sm</p>
          <p className='hidden md:block lg:hidden'>md</p>
          <p className='hidden lg:block xl:hidden'>lg</p>
          <p className='hidden xl:block 2xl:hidden'>xl</p>
          <p className='hidden 2xl:block'>2xl</p>
        </div> */}
      </body>
    </html>
  );
}
