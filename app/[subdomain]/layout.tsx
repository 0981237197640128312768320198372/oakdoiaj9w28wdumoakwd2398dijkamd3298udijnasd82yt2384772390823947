import { SellerTheme } from '@/components/seller/SellerTheme';
import { Metadata } from 'next';
import '@/styles/globals.css';

interface SubdomainLayoutProps {
  children: React.ReactNode;
  params: { subdomain: string };
}

export const metadata: Metadata = {
  title: 'Storefront',
  description: 'Storefront layout for seller subdomains',
};

export default function SubdomainLayout({ children, params }: SubdomainLayoutProps) {
  const { subdomain } = params;

  return (
    <html lang="en">
      <body className="font-aktivGroteskRegular min-h-screen bg-dark-800 text-light-200 overflow-x-hidden selection:bg-primary/50  selection:text-primary">
        <SellerTheme subdomain={subdomain}>{children}</SellerTheme>
      </body>
    </html>
  );
}
