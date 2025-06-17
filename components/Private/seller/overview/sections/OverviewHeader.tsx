/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Settings, Star, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { useSellerStats } from '@/hooks/useSellerStats';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import { MetricCard } from '../components/MetricCard';
import { SettingsDropdown } from '../components/SettingsDropdown';
import { PiGlobeSimpleBold } from 'react-icons/pi';
import Link from 'next/link';

interface OverviewHeaderProps {
  seller: any;
  ratingStats?: {
    averageRating: number;
    totalReviews: number;
  } | null;
  ratingLoading?: boolean;
}

export function OverviewHeader({ seller, ratingStats, ratingLoading }: OverviewHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { statistics, isLoading: statsLoading } = useSellerStats(seller?.username);

  const metrics = [
    {
      label: 'Revenue',
      value: statistics?.totalRevenue || 0,
      icon: DollarSign,
      color: 'text-green-500',
      format: 'currency',
      loading: statsLoading,
    },
    {
      label: 'Orders',
      value: statistics?.completedOrders || 0,
      icon: ShoppingCart,
      color: 'text-blue-500',
      format: 'number',
      loading: statsLoading,
    },
    {
      label: 'Products',
      value: statistics?.totalProducts || 0,
      icon: Package,
      color: 'text-purple-500',
      format: 'number',
      loading: statsLoading,
    },
    {
      label: 'Rating',
      value: ratingStats?.averageRating || 0,
      icon: Star,
      color: 'text-yellow-500',
      format: 'rating',
      loading: ratingLoading,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Store Header Card */}
      <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-dark-600">
              <Image
                src={seller?.store?.logoUrl || dokmailogosquare}
                alt={seller?.store?.name || 'Store'}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <div>
              <h1 className="text-sm font-medium text-white">{seller?.store?.name}</h1>
              <div className="flex items-center gap-2 text-xs text-light-400">
                <span>@{seller?.username}</span>
                <span>•</span>
                <span className="flex gap-1 items-center">
                  <PiGlobeSimpleBold />
                  <Link href={`https://${seller?.username}.dokmai.store`} target="blank">
                    {seller?.username}.dokmai.store
                  </Link>
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-dark-600 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-light-400" />
            </button>

            {showSettings && (
              <SettingsDropdown onClose={() => setShowSettings(false)} seller={seller} />
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            format={metric.format}
            loading={metric.loading}
          />
        ))}
      </div>
    </div>
  );
}
