'use client';

import React from 'react';
import { RatingDistribution } from '@/components/shared/RatingDistribution';

// Mock data for testing
const mockStats = {
  averageRating: 4.2,
  totalReviews: 150,
  ratingDistribution: {
    '1': 5,
    '2': 10,
    '3': 25,
    '4': 60,
    '5': 50,
  },
};

const mockStatsEmpty = {
  averageRating: 0,
  totalReviews: 0,
  ratingDistribution: {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
  },
};

const mockTheme = {
  sellerId: 'test-seller-id',
  baseTheme: 'light' as const,
  customizations: {
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
    },
    button: {
      textColor: '#ffffff',
      backgroundColor: '#3b82f6',
      roundedness: 'md' as const,
      shadow: 'sm' as const,
      border: 'none' as const,
      borderColor: '#3b82f6',
    },
    componentStyles: {
      cardRoundedness: 'lg' as const,
      cardShadow: 'sm' as const,
    },
    ads: {
      images: [],
      roundedness: 'md' as const,
      shadow: 'sm' as const,
    },
  },
};

export default function RatingDistributionTest() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900">Rating Distribution Test</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">With Mock Data (150 reviews)</h2>
          <RatingDistribution stats={mockStats} theme={mockTheme} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Empty State (0 reviews)</h2>
          <RatingDistribution stats={mockStatsEmpty} theme={mockTheme} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Null Stats</h2>
          <RatingDistribution stats={null} theme={mockTheme} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Undefined Stats</h2>
          <RatingDistribution stats={undefined} theme={mockTheme} />
        </div>
      </div>

      <div className="mt-8 p-4 bg-white rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-2">Debug Info:</h3>
        <pre className="text-xs text-gray-600 overflow-auto">
          {JSON.stringify({ mockStats, mockStatsEmpty }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
