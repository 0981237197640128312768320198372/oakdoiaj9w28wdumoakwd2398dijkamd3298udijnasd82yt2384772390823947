/* eslint-disable @typescript-eslint/no-unused-vars */
import { StoreData } from '@/components/seller/StoreData';
import { BuyerAuthProvider } from '@/context/BuyerAuthContext';
import '@/styles/globals.css';

interface SubdomainLayoutProps {
  children: React.ReactNode;
}

export default function SubdomainLayout({ children }: SubdomainLayoutProps) {
  return (
    <html lang="en">
      <script async src="https://cdn.tailwindcss.com"></script>
      <body className="font-aktivGroteskRegular min-h-screen bg-dark-800">
        <StoreData>
          <BuyerAuthProvider>{children}</BuyerAuthProvider>
        </StoreData>
      </body>
    </html>
  );
}
