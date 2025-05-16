import LoginSellerPage from '@/components/seller/LoginSellerPage';
import { generateMetadata } from '@/lib/utils';
import React from 'react';
export const metadata = generateMetadata({
  title: 'Login Seller',
  iconUrl: '/icons/favicon-app.png',
});
const page = () => {
  return (
    <div>
      <LoginSellerPage />
    </div>
  );
};

export default page;
