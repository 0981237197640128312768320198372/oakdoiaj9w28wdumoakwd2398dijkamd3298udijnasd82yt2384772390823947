import { SellerTheme } from '@/components/seller/SellerTheme';
import { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Storefront',
  description: 'Storefront layout for seller subdomains',
};

export default function SubdomainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-aktivGroteskRegular min-h-screen bg-dark-800 text-light-200 overflow-x-hidden selection:bg-primary/50  selection:text-primary">
        <SellerTheme>{children}</SellerTheme>
      </body>
    </html>
  );
}
