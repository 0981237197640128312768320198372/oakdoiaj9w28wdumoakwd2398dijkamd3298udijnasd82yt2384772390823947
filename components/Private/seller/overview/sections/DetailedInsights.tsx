'use client';

import { Users, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { useDetailedInsights } from '@/hooks/useDetailedInsights';
import { useMemo } from 'react';

export function DetailedInsights() {
  const { seller: authSeller } = useSellerAuth();
  const { insights, isLoading, error } = useDetailedInsights(authSeller?.username || null);

  // Use real data from the detailed insights API
  const displayData = useMemo(() => {
    if (!insights) {
      return {
        customerAnalytics: { newCustomers: 0, returningCustomers: 0, avgOrderValue: 0 },
        financialSummary: { thisMonth: 0, lastMonth: 0, growth: 0 },
        growthTrends: { ordersGrowth: 0, revenueGrowth: 0, customerGrowth: 0 },
      };
    }

    return {
      customerAnalytics: {
        newCustomers: insights.customerAnalytics.newCustomers,
        returningCustomers: insights.customerAnalytics.returningCustomers,
        avgOrderValue: insights.customerAnalytics.avgOrderValue,
      },
      financialSummary: {
        thisMonth: insights.financialSummary.thisMonth,
        lastMonth: insights.financialSummary.lastMonth,
        growth: insights.financialSummary.growth,
      },
      growthTrends: {
        ordersGrowth: insights.growthTrends.ordersGrowth,
        revenueGrowth: insights.growthTrends.revenueGrowth,
        customerGrowth: insights.growthTrends.customerGrowth,
      },
    };
  }, [insights]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(Math.round(num));
  };

  if (error) {
    return (
      <div className="space-y-5">
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-5 text-center">
          <p className="text-xs text-red-400">Failed to load insights data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Customer Analytics */}
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
          <h3 className="text-xs font-medium text-light-300 mb-3 flex items-center gap-2">
            <Users className="w-3 h-3" />
            Customer Analytics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">New Customers</span>
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-light-400" />
              ) : (
                <span className="text-xs font-medium text-white">
                  {formatNumber(displayData.customerAnalytics.newCustomers)}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Returning</span>
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-light-400" />
              ) : (
                <span className="text-xs font-medium text-white">
                  {formatNumber(displayData.customerAnalytics.returningCustomers)}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Avg. Order Value</span>
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-light-400" />
              ) : (
                <span className="text-xs font-medium text-white">
                  {formatCurrency(displayData.customerAnalytics.avgOrderValue)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
          <h3 className="text-xs font-medium text-light-300 mb-3 flex items-center gap-2">
            <DollarSign className="w-3 h-3" />
            Financial Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">This Month</span>
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-light-400" />
              ) : (
                <span className="text-xs font-medium text-white">
                  {formatCurrency(displayData.financialSummary.thisMonth)}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Last Month</span>
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-light-400" />
              ) : (
                <span className="text-xs font-medium text-white">
                  {formatCurrency(displayData.financialSummary.lastMonth)}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Growth</span>
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-light-400" />
              ) : (
                <span
                  className={`text-xs font-medium ${
                    displayData.financialSummary.growth >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {formatPercentage(displayData.financialSummary.growth)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Growth Trends */}
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
          <h3 className="text-xs font-medium text-light-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            Growth Trends
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Orders Growth</span>
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-light-400" />
              ) : (
                <span
                  className={`text-xs font-medium ${
                    displayData.growthTrends.ordersGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {formatPercentage(displayData.growthTrends.ordersGrowth)}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Revenue Growth</span>
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-light-400" />
              ) : (
                <span
                  className={`text-xs font-medium ${
                    displayData.growthTrends.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {formatPercentage(displayData.growthTrends.revenueGrowth)}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Customer Growth</span>
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-light-400" />
              ) : (
                <span
                  className={`text-xs font-medium ${
                    displayData.growthTrends.customerGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {formatPercentage(displayData.growthTrends.customerGrowth)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
