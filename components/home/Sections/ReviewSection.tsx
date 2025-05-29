import React from 'react';

import { Reviews } from '@/components/home/general/Reviews';
import { FiveStarsReview, FiveStarsReview2 } from '@/constant';
import SubTitle from '../general/SubTitle';

const ReviewSection = () => {
  return (
    <section
      id="5StarsReviews"
      className="h-[40rem] w-screen px-5 lg:p-0 rounded-md flex flex-col antialiased bg-transparent items-center justify-center relative overflow-hidden mt-20 __container">
      <SubTitle title="Feedback" className="w-full md:w-3/4 lg:w-full" />
      <div className="mt-16">
        <Reviews reviewsData={FiveStarsReview} direction="right" speed="slow" />
        <Reviews reviewsData={FiveStarsReview2} direction="left" speed="slow" />
      </div>
    </section>
  );
};

export default ReviewSection;
