/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { useBuyerActivities } from '@/hooks/useBuyerActivities';
import type { ThemeType } from '@/types';
import { BalanceCard } from './BalanceCard';
import { ActivityTabs } from './ActivityTabs';
import { ActivityList } from './ActivityList';
import { StatsGrid } from './StatsGrid';
import { DashboardHeader } from './DashboardHeader';

interface BuyerDashboardProps {
  theme: ThemeType | null;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ theme }) => {
  const { buyer } = useBuyerAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activityFilter, setActivityFilter] = useState<{
    category?: string;
    type?: string;
    search?: string;
  }>({});

  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
    pagination,
    refetch,
    loadMore,
  } = useBuyerActivities(activityFilter);

  if (!buyer) {
    return (
      <div className="flex items-center justify-center ">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <User size={24} className="text-gray-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              No buyer data available
            </h2>
            <p className="text-xs text-gray-500">Please log in again</p>
          </div>
        </div>
      </div>
    );
  }

  const handleFilterChange = (newFilter: { category?: string; type?: string; search?: string }) => {
    setActivityFilter(newFilter);
    refetch(newFilter);
  };

  // Calculate statistics
  const financialActivities = activities.filter((a) => a.category === 'financial');
  const interactionActivities = activities.filter((a) => a.category === 'interaction');
  const completedTransactions = financialActivities.filter((a) => a.status === 'completed');

  const stats = {
    totalActivities: activities.length,
    completedTransactions: completedTransactions.length,
    interactions: interactionActivities.length,
    memberSince: buyer.createdAt,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-screen-lg mx-auto space-y-4 min-h-[75vh]">
      <div className="flex flex-col lg:flex-row gap-5 w-full">
        <DashboardHeader buyer={buyer} theme={theme} />

        <BalanceCard
          balance={buyer.balance || 0}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance(!showBalance)}
          theme={theme}
        />
      </div>

      <ActivityTabs activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}>
            {activeTab === 'overview' && <StatsGrid stats={stats} theme={theme} />}

            {(activeTab === 'activities' ||
              activeTab === 'transactions' ||
              activeTab === 'interactions') && (
              <ActivityList
                activities={activities}
                loading={activitiesLoading}
                error={activitiesError}
                pagination={pagination}
                activeTab={activeTab}
                filter={activityFilter}
                onFilterChange={handleFilterChange}
                onLoadMore={loadMore}
                onRefresh={() => refetch()}
                theme={theme}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BuyerDashboard;
