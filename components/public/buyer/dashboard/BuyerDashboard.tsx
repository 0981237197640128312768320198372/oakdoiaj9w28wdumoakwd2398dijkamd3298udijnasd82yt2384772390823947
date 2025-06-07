/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { useBuyerActivitiesWithSWR } from '@/hooks/useBuyerActivitiesWithSWR';
import { useBuyerDetailsWithSWR } from '@/hooks/useBuyerDetailsWithSWR';
import type { ThemeType } from '@/types';
import { ActivityList } from './ActivityList';
import { StatsGrid } from './StatsGrid';
import { DashboardHeader } from './DashboardHeader';
import DepositForm from './DepositForm';

interface BuyerDashboardProps {
  theme: ThemeType | null;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ theme }) => {
  const { buyer: authBuyer, refreshBalance } = useBuyerAuth();
  const { buyer, refreshBuyerDetails } = useBuyerDetailsWithSWR();
  const [localBuyer, setLocalBuyer] = useState(authBuyer);

  useEffect(() => {
    if (buyer) {
      setLocalBuyer(buyer);
    }
  }, [buyer]);
  const [activeTab, setActiveTab] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [showContactList, setShowContactList] = useState(false);
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
  } = useBuyerActivitiesWithSWR(activityFilter);

  const handleFilterChange = (newFilter: { category?: string; type?: string; search?: string }) => {
    setActivityFilter(newFilter);
    refetch(newFilter);
  };

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshBuyerDetails(), refetch(activityFilter), refreshBalance()]);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  }, [refreshBuyerDetails, refetch, activityFilter, refreshBalance]);

  if (!localBuyer) {
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

  const financialActivities = activities.filter((a) => a.category === 'financial');
  const interactionActivities = activities.filter((a) => a.category === 'interaction');
  const completedTransactions = financialActivities.filter((a) => a.status === 'completed');

  const stats = {
    totalActivities: activities.length,
    completedTransactions: completedTransactions.length,
    interactions: interactionActivities.length,
    memberSince: localBuyer.createdAt,
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-screen-lg lg:px-5 xl:px-0 space-y-5 min-h-[75vh]">
        <DashboardHeader
          buyer={localBuyer}
          theme={theme}
          onProfileUpdate={refreshBuyerDetails}
          onDepositClick={() => setIsDepositModalOpen(true)}
          onRefresh={refreshAllData}
          isRefreshing={isRefreshing}
          handleEditProfile={() => setIsEditProfileModalOpen(true)}
          handleLogout={() => {}}
          handleToggleContactList={() => setShowContactList(!showContactList)}
          isEditProfileModalOpen={isEditProfileModalOpen}
          setIsEditProfileModalOpen={setIsEditProfileModalOpen}
          showContactList={showContactList}
        />
        {isDepositModalOpen ? (
          <DepositForm
            theme={theme}
            onBalanceUpdate={refreshBuyerDetails}
            isOpen={isDepositModalOpen}
            onClose={() => setIsDepositModalOpen(false)}
          />
        ) : (
          <div className="space-y-5">
            <StatsGrid
              stats={stats}
              theme={theme}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab || 'latest'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}>
                <ActivityList
                  activities={activities}
                  loading={activitiesLoading}
                  error={activitiesError}
                  pagination={pagination}
                  activeTab={activeTab || 'latest'}
                  filter={activityFilter}
                  onFilterChange={handleFilterChange}
                  onLoadMore={loadMore}
                  onRefresh={() => refetch()}
                  theme={theme}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default BuyerDashboard;
