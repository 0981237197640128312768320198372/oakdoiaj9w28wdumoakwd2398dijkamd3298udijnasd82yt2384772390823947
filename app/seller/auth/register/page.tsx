import RegisterSellerPage from '@/components/public/store/RegisterSellerPage';
import { generateMetadata } from '@/lib/utils';
import React from 'react';
export const metadata = generateMetadata({
  title: 'Register Seller',
  iconUrl: '/icons/favicon.png',
});
const page = () => {
  return (
    <div>
      <RegisterSellerPage />
    </div>
  );
};

export default page;
