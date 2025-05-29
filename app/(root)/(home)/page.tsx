/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { generateMetadata } from '@/lib/utils';
import { HomeWrapper } from '@/components/home/Sections/HomeWrapper';
import HeroSection from '@/components/home/Sections/HeroSection';
import RecomendationsSection from '@/components/home/Sections/RecomendationsSection';
import WeeklyTop10Section from '@/components/home/Sections/WeeklyTop10Section';
import FAQSection from '@/components/home/Sections/FAQSection';
import ReviewSection from '@/components/home/Sections/ReviewSection';

export const metadata = generateMetadata({
  title: 'แอพพรีเมียมคุณภาพสูง',
  description:
    'แพลตฟอร์มสินค้าดิจิทัลที่ดีที่สุดในประเทศไทย สำหรับทุกคนที่ต้องการบัญชีแอพพรีเมียมในราคาถูกและคุณภาพดี ไม่ว่าจะเป็น Netflix Premium, Amazon Prime Video หรือบริการอื่น ๆ ที่ Dokmai Store เราเป็นผู้ขายอันดับหนึ่งในไทย พร้อมการันตีคุณภาพการใช้งานตลอดอายุการใช้งาน ด้วยบริการที่เชื่อถือได้ ตอบกลับลูกค้าอย่างรวดเร็วภายใน 10 นาที และไม่เกิน 24 ชั่วโมง พร้อมช่วยแก้ไขปัญหาทุกอย่างเพื่อให้คุณได้รับประสบการณ์การใช้งานที่ดีที่สุด.',
  url: 'https://www.dokmaistore.com',
});
export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center __container">
      <HomeWrapper>
        {/* <AlertAnnouncement /> */}
        <HeroSection />
        <RecomendationsSection />
        <WeeklyTop10Section />
        <FAQSection />
        {/* <CreditsSection /> */}
        <ReviewSection />
      </HomeWrapper>
    </main>
  );
}
