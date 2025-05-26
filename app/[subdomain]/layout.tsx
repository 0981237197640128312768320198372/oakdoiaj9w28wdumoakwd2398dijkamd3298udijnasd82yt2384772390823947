/* eslint-disable @typescript-eslint/no-unused-vars */
import { StoreData } from '@/components/seller/StoreData';
import '@/styles/globals.css';

interface SubdomainLayoutProps {
  children: React.ReactNode;
}

export default function SubdomainLayout({ children }: SubdomainLayoutProps) {
  return (
    <html lang="en">
      <script async src="https://cdn.tailwindcss.com"></script>
      <body className="font-aktivGroteskRegular min-h-screen">
        <StoreData>{children}</StoreData>
      </body>
    </html>
  );
}
