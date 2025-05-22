/* eslint-disable @typescript-eslint/no-unused-vars */
import { StoreData } from '@/components/seller/StoreData';
import '@/styles/globals.css';

interface SubdomainLayoutProps {
  children: React.ReactNode;
}

export default function SubdomainLayout({ children }: SubdomainLayoutProps) {
  return (
    <html lang="en">
      <body className="font-aktivGroteskRegular min-h-screen bg-dark-800 text-light-200 overflow-x-hidden selection:bg-primary/50 selection:text-primary pt-10">
        <StoreData>{children}</StoreData>
      </body>
    </html>
  );
}
