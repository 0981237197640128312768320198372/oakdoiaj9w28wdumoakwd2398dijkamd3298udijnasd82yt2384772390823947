'use client';

import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Package,
  Wallet,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface ActivityListProps {
  activities: any[];
  loading: boolean;
  error: string | null;
  pagination: any;
  activeTab: string;
  filter: any;
  onFilterChange: (filter: any) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  theme: ThemeType | null;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  loading,
  error,
  pagination,
  activeTab,
  filter,
  onFilterChange,
  onLoadMore,
  onRefresh,
  theme,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filter.search || '');
  const themeUtils = useThemeUtils(theme);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { size: 14 };
    switch (status) {
      case 'completed':
        return <CheckCircle {...iconProps} className="text-green-500" />;
      case 'pending':
        return <Clock {...iconProps} className="text-yellow-500" />;
      case 'failed':
        return <XCircle {...iconProps} className="text-red-500" />;
      case 'cancelled':
        return <XCircle {...iconProps} className="text-gray-500" />;
      case 'processing':
        return <RefreshCw {...iconProps} className="text-blue-500 animate-spin" />;
      default:
        return <AlertCircle {...iconProps} className="text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string, category: string) => {
    const iconProps = { size: 14 };
    if (category === 'financial') {
      switch (type) {
        case 'deposit':
          return <TrendingUp {...iconProps} className="text-green-500" />;
        case 'withdrawal':
          return <TrendingDown {...iconProps} className="text-red-500" />;
        case 'purchase':
          return <Package {...iconProps} className="text-blue-500" />;
        default:
          return <Wallet {...iconProps} className="text-gray-500" />;
      }
    } else if (category === 'interaction') {
      switch (type) {
        case 'review':
          return <Star {...iconProps} className="text-yellow-500" />;
        default:
          return <MessageSquare {...iconProps} className="text-gray-500" />;
      }
    }
    return <Package {...iconProps} className="text-gray-500" />;
  };

  const getActivityDescription = (activity: any) => {
    const { type, category, metadata } = activity;
    if (category === 'financial') {
      switch (type) {
        case 'deposit':
          return `Deposit of ${formatCurrency(metadata.amount || 0)}`;
        case 'withdrawal':
          return `Withdrawal of ${formatCurrency(metadata.amount || 0)}`;
        case 'purchase':
          return `Purchase: ${metadata.productName || 'Unknown product'}`;
        default:
          return `${type} transaction`;
      }
    } else if (category === 'interaction') {
      switch (type) {
        case 'review':
          return `Review: ${metadata.rating}/5 stars`;
        default:
          return `${type} interaction`;
      }
    }
    return `${type} activity`;
  };

  const filteredActivities = activities.filter((activity) => {
    if (activeTab === 'transactions') return activity.category === 'financial';
    if (activeTab === 'interactions') return activity.category === 'interaction';
    return true;
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    onFilterChange({ ...filter, search: term });
  };

  return (
    <div
      className={cn(
        'p-4 border backdrop-blur-sm transition-all duration-300',
        themeUtils.getCardClass(),
        themeUtils.getComponentRoundednessClass(),
        themeUtils.getComponentShadowClass()
      )}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Package size={16} />
          {activeTab === 'transactions'
            ? 'Financial Activities'
            : activeTab === 'interactions'
            ? 'Interaction Activities'
            : 'All Activities'}
        </h3>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={cn(
                'pl-8 pr-3 py-1.5 text-xs border transition-all duration-300 focus:outline-none focus:ring-0',
                themeUtils.getCardClass(),
                themeUtils.getComponentRoundednessClass(),
                themeUtils.getPrimaryColorClass('border'),
                'w-32 sm:w-40'
              )}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-all duration-300',
              themeUtils.getCardClass(),
              themeUtils.getComponentRoundednessClass(),
              'border hover:shadow-sm'
            )}>
            <Filter size={14} />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-all duration-300',
              themeUtils.getCardClass(),
              themeUtils.getComponentRoundednessClass(),
              'border hover:shadow-sm disabled:opacity-50'
            )}>
            <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-wrap gap-2">
              <select
                value={filter.category || ''}
                onChange={(e) =>
                  onFilterChange({ ...filter, category: e.target.value || undefined })
                }
                className={cn(
                  'px-2 py-1 text-xs border transition-all duration-300',
                  themeUtils.getCardClass(),
                  themeUtils.getComponentRoundednessClass()
                )}>
                <option value="">All Categories</option>
                <option value="financial">Financial</option>
                <option value="interaction">Interaction</option>
                <option value="system">System</option>
              </select>

              <select
                value={filter.type || ''}
                onChange={(e) => onFilterChange({ ...filter, type: e.target.value || undefined })}
                className={cn(
                  'px-2 py-1 text-xs border transition-all duration-300',
                  themeUtils.getCardClass(),
                  themeUtils.getComponentRoundednessClass()
                )}>
                <option value="">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="purchase">Purchase</option>
                <option value="review">Review</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mb-4 px-3 py-2 text-xs border-l-4 flex items-center gap-2',
            themeUtils.getComponentRoundednessClass(),
            'bg-red-50 border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300'
          )}>
          <AlertCircle size={14} />
          {error}
        </motion.div>
      )}

      {/* Loading State */}
      {loading && filteredActivities.length === 0 ? (
        <div className="text-center py-8">
          <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-gray-400" />
          <p className="text-xs text-gray-500">Loading activities...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-8">
          <Package size={20} className="mx-auto mb-2 text-gray-400" />
          <p className="text-xs text-gray-500">No activities found</p>
        </div>
      ) : (
        /* Activity List */
        <div className="space-y-2">
          <AnimatePresence>
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  'flex items-center justify-between p-3 border transition-all duration-300 hover:shadow-sm',
                  themeUtils.getCardClass(),
                  themeUtils.getComponentRoundednessClass()
                )}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type, activity.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                      {getActivityDescription(activity)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      {getStatusIcon(activity.status)}
                      <span className="capitalize">{activity.status}</span>
                      {activity.metadata.ipAddress && (
                        <span className="text-red-500 font-mono">
                          • {activity.metadata.ipAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  {activity.metadata.amount && (
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(activity.metadata.amount)}
                    </p>
                  )}
                  {activity.metadata.rating && (
                    <div className="flex items-center gap-0.5 justify-end">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className={
                            i < activity.metadata.rating!
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(activity.createdAt)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Load More */}
          {pagination.hasMore && (
            <div className="text-center pt-3">
              <button
                onClick={onLoadMore}
                disabled={loading}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all duration-300 mx-auto',
                  themeUtils.getCardClass(),
                  themeUtils.getComponentRoundednessClass(),
                  'border hover:shadow-sm disabled:opacity-50'
                )}>
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    Load More
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
