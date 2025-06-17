'use client';

import { useState } from 'react';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { useSellerRatingStats } from '@/hooks/useSellerRatingStats';
import { OverviewHeader } from './sections/OverviewHeader';
import { AnalyticsDashboard } from './sections/AnalyticsDashboard';
import { StoreHealthMonitor } from './sections/StoreHealthMonitor';
import { DetailedInsights } from './sections/DetailedInsights';
import { ThemeCustomizerPage } from './pages/ThemeCustomizerPage';
import { ProfileEditPage } from './pages/ProfileEditPage';

type ViewType = 'overview' | 'theme-customizer' | 'edit-profile';

export default function SellerOverview() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const { seller } = useSellerAuth();
  const {
    stats: ratingStats,
    reviews,
    isLoading: ratingLoading,
  } = useSellerRatingStats(seller?._id || null);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
  };

  if (!seller) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-light-400">Please log in to view your store overview.</p>
      </div>
    );
  }

  // Render different views based on current state
  if (currentView === 'theme-customizer') {
    return <ThemeCustomizerPage seller={seller} onBack={handleBackToOverview} />;
  }

  if (currentView === 'edit-profile') {
    return <ProfileEditPage seller={seller} onBack={handleBackToOverview} />;
  }

  // Default overview view
  return (
    <div className="space-y-5 px-5 lg:px-0 max-w-screen-lg min-h-[75vh]">
      {/* Header with store info and key metrics */}
      <OverviewHeader
        seller={seller}
        ratingStats={ratingStats}
        ratingLoading={ratingLoading}
        onViewChange={handleViewChange}
      />

      {/* Detailed Insights */}
      <DetailedInsights />
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
