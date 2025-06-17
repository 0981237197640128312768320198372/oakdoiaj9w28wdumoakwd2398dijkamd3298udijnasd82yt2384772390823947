/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { InventoryAlerts } from '../components/InventoryAlerts';
import { ReviewsSummary } from '../components/ReviewsSummary';

interface StoreHealthMonitorProps {
  seller: any;
  ratingStats?: {
    averageRating: number;
    totalReviews: number;
  } | null;
  reviews?: Array<{
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    buyerName?: string;
    buyerEmail?: string;
    buyerAvatarUrl?: string;
    buyerId?: {
      name?: string;
      email?: string;
    };
  }>;
  ratingLoading?: boolean;
}

export function StoreHealthMonitor({
  seller,
  ratingStats,
  reviews,
  ratingLoading,
}: StoreHealthMonitorProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inventory Alerts */}
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
          <h3 className="text-xs font-medium text-light-300 mb-3">Inventory Status</h3>
          <InventoryAlerts seller={seller} />
        </div>

        {/* Customer Feedback */}
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
          <h3 className="text-xs font-medium text-light-300 mb-3">Customer Feedback</h3>
          <ReviewsSummary
            seller={seller}
            ratingStats={ratingStats}
            reviews={reviews}
            isLoading={ratingLoading}
          />
        </div>
      </div>
    </div>
  );
}
