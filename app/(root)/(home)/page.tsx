import React from 'react';
import { generateMetadata } from '@/lib/utils';
import LandingWrapper from '@/components/home/landing/LandingWrapper';
import HeroComparison from '@/components/home/landing/HeroComparison';
import ProblemSolution from '@/components/home/landing/ProblemSolution';

export const metadata = generateMetadata({
  title: "Dokmai Store - Thailand's Professional Digital Marketplace Platform",
  description:
    'The professional digital marketplace platform Thailand deserves. Sell freely, buy easily with 100% free forever platform. Clean interface, lightning fast performance, professional subdomains, unlimited customization. Built by real developers for serious sellers and buyers.',
  url: 'https://www.dokmaistore.com',
});

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center __container">
      <LandingWrapper>
        <HeroComparison />
        <ProblemSolution />
      </LandingWrapper>
    </main>
  );
}
