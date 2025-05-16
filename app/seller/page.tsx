import SellerPageContent from '@/components/seller/SellerPageContent';
import { SellerDashboardProvider } from '@/context/SellerDashboardContext';
import { generateMetadata } from '@/lib/utils';
import React from 'react';

export const metadata = generateMetadata({
  title: 'Store Management',
  iconUrl: '/icons/favicon.png',
  manifest: 'manifest.json',
  description:
    'ยินดีต้อนรับสู่แดชบอร์ดส่วนตัว ซึ่งเป็นพื้นที่ที่คุณสามารถเข้าถึงข้อมูลสำคัญได้อย่างสะดวกและปลอดภัย.',
  url: 'https://seller.dokmaistore.com',
});

const page = () => {
  return (
    <SellerDashboardProvider>
      <SellerPageContent />
    </SellerDashboardProvider>
  );
};

export default page;
