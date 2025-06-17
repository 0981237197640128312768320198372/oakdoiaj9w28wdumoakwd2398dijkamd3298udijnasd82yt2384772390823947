/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useSellerOrders } from '@/hooks/useSellerOrders';
import { SalesChart } from '../components/SalesChart';
import { OrderStatusChart } from '../components/OrderStatusChart';
import { ActivityTimeline } from '../components/ActivityTimeline';

interface AnalyticsDashboardProps {
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

export function AnalyticsDashboard({
  seller,
  ratingStats,
  reviews,
  ratingLoading,
}: AnalyticsDashboardProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ratingStats = ratingStats;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _reviews = reviews;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ratingLoading = ratingLoading;
  const { orders, loading } = useSellerOrders(seller?._id, 1, 'all');

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales Chart */}
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
          <h3 className="text-xs font-medium text-light-300 mb-3">Sales Trend (30 Days)</h3>
          <SalesChart seller={seller} />
        </div>

        {/* Order Status Distribution */}
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
          <h3 className="text-xs font-medium text-light-300 mb-3">Order Status</h3>
          <OrderStatusChart orders={orders} loading={loading} />
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
        <h3 className="text-xs font-medium text-light-300 mb-3">Recent Activity</h3>
        <ActivityTimeline orders={orders} loading={loading} />
      </div>
    </div>
  );
}
