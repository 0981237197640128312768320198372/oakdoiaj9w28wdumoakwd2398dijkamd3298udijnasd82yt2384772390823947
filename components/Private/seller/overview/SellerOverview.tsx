'use client';

import { useSellerAuth } from '@/context/SellerAuthContext';
import { useSellerRatingStats } from '@/hooks/useSellerRatingStats';
import { OverviewHeader } from './sections/OverviewHeader';
import { AnalyticsDashboard } from './sections/AnalyticsDashboard';
import { StoreHealthMonitor } from './sections/StoreHealthMonitor';
import { DetailedInsights } from './sections/DetailedInsights';

export default function SellerOverview() {
  const { seller } = useSellerAuth();
  const {
    stats: ratingStats,
    reviews,
    isLoading: ratingLoading,
  } = useSellerRatingStats(seller?._id || null);

  if (!seller) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-light-400">Please log in to view your store overview.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-5 lg:px-0 max-w-screen-lg min-h-[75vh]">
      {/* Header with store info and key metrics */}
      <OverviewHeader seller={seller} ratingStats={ratingStats} ratingLoading={ratingLoading} />

      {/* Detailed Insights */}
      <DetailedInsights seller={seller} />
      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        seller={seller}
        ratingStats={ratingStats}
        reviews={reviews}
        ratingLoading={ratingLoading}
      />

      {/* Store Health Monitor */}
      <StoreHealthMonitor
        seller={seller}
        ratingStats={ratingStats}
        reviews={reviews}
        ratingLoading={ratingLoading}
      />
    </div>
  );
}
