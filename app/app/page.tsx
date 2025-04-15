import { ShowPremiumApps } from '@/components/ShowPremiumApps';
import { generateMetadata } from '@/lib/utils';
import React from 'react';

export const metadata = generateMetadata({
  title: 'App',
  iconUrl: '/icons/favicon-app.png',
  manifest: 'manifest-app.json',
  description:
    'ยินดีต้อนรับสู่แดชบอร์ดส่วนตัว ซึ่งเป็นพื้นที่ที่คุณสามารถเข้าถึงข้อมูลสำคัญได้อย่างสะดวกและปลอดภัย.',
  url: 'https://app.dokmaistore.com',
});
const page = () => {
  return (
    <div className="flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-20 xl:pt-32 __container">
      <div className="w-full px-5 xl:px-0 flex flex-col gap-3">
        <ShowPremiumApps />
      </div>
    </div>
  );
};

export default page;
