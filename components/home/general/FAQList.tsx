'use client';

import React from 'react';
import FAQButton from '@/components/home/general/FAQButton';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQListProps {
  faqs: FAQ[];
}

const FAQList: React.FC<FAQListProps> = ({ faqs }) => {
  return (
    <div>
      {faqs.map((faq, i) => (
        <FAQButton key={i} index={i} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
};

export default FAQList;
