/* eslint-disable @next/next/next-script-for-ga */
/* eslint-disable @typescript-eslint/no-unused-vars */
import '@/styles/globals.css';
import Navbar from '@/components/home/general/Navbar';
import Footer from '@/components/home/general/Footer';
import { Analytics } from '@vercel/analytics/react';
import { CartProvider } from '@/context/CartContext';
import { generateMetadata } from '@/lib/utils';

export const metadata = generateMetadata({
  title: '',
  iconUrl: '/icons/favicon.png',
  manifest: 'manifest.json',
  url: 'https://dokmaistore.com',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="https://cdn.tailwindcss.com"></script>
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
      <body className="font-aktivGroteskRegular min-h-screen bg-dark-800 text-light-200 overflow-x-hidden selection:bg-primary/50  selection:text-primary">
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 via-dark-700 to-dark-800">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-bg-primary/10 rounded-full animate-ping"></div>
            <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse"></div>
            <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-primary/80 rounded-full animate-ping"></div>
          </div>
        </div>
        <CartProvider>
          <Navbar />
          <div className="flex flex-col justify-start items-center w-full min-h-screen py-20 bg-dark-800">
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
