import RegisterSellerPage from '@/components/Private/seller/RegisterSellerPage';
import { generateMetadata } from '@/lib/utils';
import React from 'react';
export const metadata = generateMetadata({
  title: 'Register Seller',
  iconUrl: '/icons/favicon.png',
});
const page = () => {
  return <RegisterSellerPage />;
};

export default page;
