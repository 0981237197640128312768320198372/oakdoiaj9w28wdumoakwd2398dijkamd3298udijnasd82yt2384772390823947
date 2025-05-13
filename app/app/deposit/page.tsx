import DepositForm from '@/components/DepositForm';
import { generateMetadata } from '@/lib/utils';
import React from 'react';

export const metadata = generateMetadata({
  title: 'เติมเงิน',
  description: 'เติมเงิน Dokmai Coin',
});
const page = () => {
  return (
    <div className="h-screen w-screen justify-center flex flex-col items-center">
      <DepositForm />
    </div>
  );
};

export default page;
