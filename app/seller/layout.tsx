/* eslint-disable @next/next/next-script-for-ga */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SellerAuthProvider } from '@/context/SellerAuthContext';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-aktivGroteskRegular min-h-screen bg-dark-800 text-light-200 overflow-x-hidden selection:bg-fuchsia-500/30 selection:text-fuchsia-500 flex flex-col justify-start w-full items-center max-md:pt-32 pt-10">
        <SellerAuthProvider>{children}</SellerAuthProvider>
        {/* <div className="w-full font-aktivGroteskBold h-5 fixed bottom-0 flex justify-center items-center bg-cyan-500 sm:bg-blue-500 md:bg-green-500 lg:bg-yellow-500 xl:bg-orange-500 2xl:bg-red-500 ">
          <p className="hidden sm:block md:hidden">sm</p>
          <p className="hidden md:block lg:hidden">md</p>
          <p className="hidden lg:block xl:hidden">lg</p>
          <p className="hidden xl:block 2xl:hidden">xl</p>
          <p className="hidden 2xl:block">2xl</p>
        </div> */}
      </body>
    </html>
  );
}
