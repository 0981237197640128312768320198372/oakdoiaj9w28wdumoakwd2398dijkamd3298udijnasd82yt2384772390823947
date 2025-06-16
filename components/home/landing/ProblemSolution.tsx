'use client';

import React from 'react';

interface ProblemItem {
  icon: string;
  title: string;
  description: string;
}

interface SolutionItem {
  icon: string;
  title: string;
  description: string;
}

const problemData: ProblemItem[] = [
  {
    icon: '🤮',
    title: 'Messy, Confusing Interface',
    description: "Can't find anything",
  },
  {
    icon: '🐌',
    title: 'Slow, Inefficient System',
    description: 'Wastes your time',
  },
  {
    icon: '🔗',
    title: 'Ugly, Unprofessional URLs',
    description: 'Embarrassing to share',
  },
  {
    icon: '🎨',
    title: 'Limited, Rigid Themes',
    description: 'All stores look the same',
  },
  {
    icon: '💸',
    title: 'Hidden Fees & Commissions',
    description: 'Surprise charges everywhere',
  },
];

const solutionData: SolutionItem[] = [
  {
    icon: '✨',
    title: 'Clean, Intuitive Design',
    description: 'Everything where it should be',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast Performance',
    description: 'Optimized database & code',
  },
  {
    icon: '🌐',
    title: 'Professional Subdomains',
    description: 'yourstore.dokmaistore.com',
  },
  {
    icon: '🎨',
    title: 'Unlimited Customization',
    description: 'Make it truly yours',
  },
  {
    icon: '🆓',
    title: 'Completely Free Forever',
    description: 'No hidden costs, ever',
  },
];

interface ProblemSolutionProps {
  sectionTitle?: string;
  problemTitle?: string;
  solutionTitle?: string;
}

export default function ProblemSolution({
  sectionTitle = 'Tired of Unprofessional Platforms?',
  problemTitle = "What You're Used To:",
  solutionTitle = 'What You Get with Dokmai Store:',
}: ProblemSolutionProps) {
  return (
    <section className="py-12 md:py-20 bg-light-50">
      <div className="__container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-aktivGroteskBold text-dark-800 mb-4">
            {sectionTitle}
          </h2>
        </div>

        {/* Problem vs Solution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Problems Side */}
          <div className="space-y-6">
            <div className="text-center lg:text-left mb-8">
              <h3 className="text-xl md:text-2xl font-aktivGroteskBold text-red-800 mb-2">
                ❌ {problemTitle}
              </h3>
            </div>

            <div className="space-y-4">
              {problemData.map((problem, index) => (
                <div
                  key={index}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl md:text-3xl flex-shrink-0">{problem.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-aktivGroteskMedium text-red-800 text-sm md:text-base mb-1">
                        {problem.title}
                      </h4>
                      <p className="text-red-700 font-aktivGroteskRegular text-xs md:text-sm">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions Side */}
          <div className="space-y-6">
            <div className="text-center lg:text-left mb-8">
              <h3 className="text-xl md:text-2xl font-aktivGroteskBold text-primary mb-2">
                ✅ {solutionTitle}
              </h3>
            </div>

            <div className="space-y-4">
              {solutionData.map((solution, index) => (
                <div
                  key={index}
                  className="bg-primary/10 border border-primary/20 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl md:text-3xl flex-shrink-0">{solution.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-aktivGroteskMedium text-primary text-sm md:text-base mb-1">
                        {solution.title}
                      </h4>
                      <p className="text-primary/80 font-aktivGroteskRegular text-xs md:text-sm">
                        {solution.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-2xl mx-auto border border-light-300">
            <h3 className="text-lg md:text-xl font-aktivGroteskBold text-dark-800 mb-4">
              Ready to Experience the Difference?
            </h3>
            <p className="text-dark-600 font-aktivGroteskRegular mb-6 text-sm md:text-base">
              Join thousands of sellers who've already upgraded to the professional platform
            </p>
            <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-aktivGroteskMedium rounded-lg hover:bg-primary/90 transition-colors text-sm md:text-base">
              Start Your Professional Store Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
