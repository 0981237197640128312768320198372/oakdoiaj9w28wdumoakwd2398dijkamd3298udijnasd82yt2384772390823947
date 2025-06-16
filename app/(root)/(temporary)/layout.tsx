/* eslint-disable @next/next/next-script-for-ga */
/* eslint-disable @typescript-eslint/no-unused-vars */
import AppNavbar from '@/components/private/seller/SellerNavbar';
import { CartProvider } from '@/context/CartContext';
import { SellerAuthProvider } from '@/context/SellerAuthContext';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <script async src="https://cdn.tailwindcss.com"></script>
      <body className="font-aktivGroteskRegular min-h-screen bg-dark-800 text-light-200 overflow-x-hidden selection:bg-primary/10 selection:text-primary flex flex-col justify-start w-full items-center p-5 xl:p-10">
        <SellerAuthProvider>{children}</SellerAuthProvider>
      </body>
    </html>
  );
}
