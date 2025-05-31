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
      <script async src="https://cdn.tailwindcss.com"></script>
      <body className="font-aktivGroteskRegular min-h-screen bg-dark-800 text-light-200 overflow-x-hidden selection:bg-fuchsia-500/30 selection:text-fuchsia-500 flex flex-col justify-start w-full items-center pt-5">
        <SellerAuthProvider>{children}</SellerAuthProvider>
      </body>
    </html>
  );
}
