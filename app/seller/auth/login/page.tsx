import LoginSellerPage from '@/components/public/store/LoginSellerPage';
import { generateMetadata } from '@/lib/utils';
import React from 'react';
export const metadata = generateMetadata({
  title: 'Login Seller',
  iconUrl: '/icons/favicon-app.png',
});
const page = () => {
  return <LoginSellerPage />;
};

export default page;
