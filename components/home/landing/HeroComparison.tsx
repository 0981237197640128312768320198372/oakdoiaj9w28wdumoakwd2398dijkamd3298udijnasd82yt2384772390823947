'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface ComparisonItem {
  feature: string;
  competitor: string;
  dokmai: string;
}

const comparisonData: ComparisonItem[] = [
  {
    feature: 'Interface',
    competitor: 'Messy, confusing',
    dokmai: 'Clean, intuitive',
  },
  {
    feature: 'Speed',
    competitor: 'Slow loading',
    dokmai: 'Lightning fast',
  },
  {
    feature: 'Customization',
    competitor: 'Limited themes',
    dokmai: 'Unlimited flexibility',
  },
  {
    feature: 'URLs',
    competitor: 'Ugly domains',
    dokmai: 'Professional subdomains',
  },
  {
    feature: 'Fees',
    competitor: 'Hidden charges',
    dokmai: '100% Free',
  },
  {
    feature: 'Support',
    competitor: 'Generic responses',
    dokmai: 'Thai team, real help',
  },
  {
    feature: 'Mobile',
    competitor: 'Broken on phones',
    dokmai: 'Perfect on all devices',
  },
  {
    feature: 'Analytics',
    competitor: 'Basic stats',
    dokmai: 'Professional insights',
  },
];

interface HeroComparisonProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
}

export default function HeroComparison({
  headline = 'Sell Freely, Buy Easily',
  subheadline = 'Dokmai Store makes it simple for everyone',
  ctaPrimary = 'Start Selling Free',
  ctaSecondary = 'Browse Products',
}: HeroComparisonProps) {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="__container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-aktivGroteskBold text-dark-800 mb-4">
            {headline}
          </h1>
          <p className="text-lg md:text-xl text-dark-400 font-aktivGroteskRegular max-w-2xl mx-auto">
            {subheadline}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-light-300">
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 bg-light-100">
              <div className="p-4 md:p-6 text-center">
                <h3 className="text-lg font-aktivGroteskMedium text-dark-600">Feature</h3>
              </div>
              <div className="p-4 md:p-6 text-center bg-red-50 border-l border-red-200">
                <h3 className="text-lg font-aktivGroteskMedium text-red-800">Other Platforms</h3>
              </div>
              <div className="p-4 md:p-6 text-center bg-primary/10 border-l border-primary/20">
                <h3 className="text-lg font-aktivGroteskMedium text-primary">Dokmai Store</h3>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-light-200">
              {comparisonData.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 hover:bg-light-50 transition-colors">
                  {/* Feature Column */}
                  <div className="p-4 md:p-6 flex items-center justify-center md:justify-start">
                    <span className="font-aktivGroteskMedium text-dark-700 text-sm md:text-base">
                      {item.feature}
                    </span>
                  </div>

                  {/* Competitor Column */}
                  <div className="p-4 md:p-6 bg-red-50/50 border-l border-red-100 flex items-center justify-center md:justify-start space-x-3">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0" />
                    <span className="text-red-800 font-aktivGroteskRegular text-xs md:text-sm">
                      {item.competitor}
                    </span>
                  </div>

                  {/* Dokmai Column */}
                  <div className="p-4 md:p-6 bg-primary/5 border-l border-primary/10 flex items-center justify-center md:justify-start space-x-3">
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-primary font-aktivGroteskRegular text-xs md:text-sm">
                      {item.dokmai}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-aktivGroteskMedium rounded-lg hover:bg-primary/90 transition-colors text-sm md:text-base">
            {ctaPrimary}
          </button>
          <button className="w-full sm:w-auto px-8 py-4 border-2 border-primary text-primary font-aktivGroteskMedium rounded-lg hover:bg-primary/10 transition-colors text-sm md:text-base">
            {ctaSecondary}
          </button>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-800 px-4 py-2 rounded-full border border-green-200">
            <Check className="w-4 h-4" />
            <span className="font-aktivGroteskMedium text-xs md:text-sm">100% Free Forever</span>
          </div>
        </div>
      </div>
    </section>
  );
}
