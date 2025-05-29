'use client';
import React from 'react';
import SubTitle from '@/components/home/general/SubTitle';
import { faqs, footerButton } from '@/constant';
import FAQButton from '../general/FAQButton';

const FAQSection = () => {
  const faqUrl = footerButton.find((button) => button.title === 'FAQ')?.url || '#';

  return (
    <section id="FrequentlyAskedQuestions" className="w-full __container mt-24 flex flex-col">
      <SubTitle
        title="Frequently Asked Questions"
        buttonMore="View More Questions"
        urlButtonMore={faqUrl}
        className="mb-16"
      />
      <div className="w-full px-5 xl:px-0 flex flex-col gap-3">
        {faqs.slice(0, 4).map((faq, index) => (
          <FAQButton key={index} index={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
