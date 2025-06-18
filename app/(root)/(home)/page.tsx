import React from 'react';
import { generateMetadata } from '@/lib/utils';
import DashboardShowcase from '@/components/shared/DashboardShowcase';
import overviewScreenshot from '@/assets/images/Overview.png';

export const metadata = generateMetadata({
  title: "Dokmai Store - Thailand's Professional Digital Marketplace Platform",
  description:
    'The professional digital marketplace platform Thailand deserves. Sell freely, buy easily with 100% free forever platform. Clean interface, lightning fast performance, professional subdomains, unlimited customization. Built by real developers for serious sellers and buyers.',
  url: 'https://www.dokmaistore.com',
});

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center __container">
      <DashboardShowcase imageUrl={overviewScreenshot as unknown as string} />
    </main>
  );
}
