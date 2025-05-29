/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Wallet,
  History,
  Star,
  MessageSquare,
  Facebook,
  Instagram,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  LogOut,
  Edit,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { useBuyerActivities } from '@/hooks/useBuyerActivities';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface BuyerDashboardProps {
  theme: ThemeType | null;
  onNavigate: (page: string) => void;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ theme, onNavigate }) => {
  const { buyer, logout } = useBuyerAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activityFilter, setActivityFilter] = useState<{
    category?: string;
    type?: string;
  }>({});

  const themeUtils = useThemeUtils(theme);

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">No buyer data available</h2>
          <p className="text-gray-500">Please log in again</p>
        </div>
      </div>
    );
  }

  const getCardStyles = () => {
    return cn(
      'p-6 border transition-all duration-300',
      themeUtils.getCardClass(),
      themeUtils.getComponentRoundednessClass(),
      themeUtils.getComponentShadowClass()
    );
  };

  const getButtonStyles = (isActive = false) => {
    return cn(
      'px-4 py-2 transition-all duration-300',
      themeUtils.getButtonRoundednessClass(),
      isActive ? themeUtils.getButtonClass() : themeUtils.getCardClass()
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-gray-500" />;
      case 'processing':
        return <RefreshCw size={16} className="text-blue-500 animate-spin" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string, category: string) => {
    if (category === 'financial') {
      switch (type) {
        case 'deposit':
          return <TrendingUp className="text-green-500" size={16} />;
        case 'withdrawal':
          return <TrendingDown className="text-red-500" size={16} />;
        case 'purchase':
          return <Package className="text-blue-500" size={16} />;
        default:
          return <Wallet className="text-gray-500" size={16} />;
      }
    } else if (category === 'interaction') {
      switch (type) {
        case 'review':
          return <Star className="text-yellow-500" size={16} />;
        case 'credit':
          return <TrendingUp className="text-purple-500" size={16} />;
        default:
          return <MessageSquare className="text-gray-500" size={16} />;
      }
    }
    return <History className="text-gray-500" size={16} />;
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
        case 'credit':
          return `${metadata.creditType} credit: ${metadata.creditValue} points`;
        default:
          return `${type} interaction`;
      }
    }
    return `${type} activity`;
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  const handleFilterChange = (newFilter: { category?: string; type?: string }) => {
    setActivityFilter(newFilter);
    refetch(newFilter);
  };

  // Calculate statistics from activities
  const financialActivities = activities.filter((a) => a.category === 'financial');
  const interactionActivities = activities.filter((a) => a.category === 'interaction');
  const completedTransactions = financialActivities.filter((a) => a.status === 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className={getCardStyles()}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {buyer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{buyer.name}</h1>
              <p className="text-gray-500">{buyer.email}</p>
              {buyer.username && <p className="text-sm text-gray-400">@{buyer.username}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button className={getButtonStyles()} onClick={() => {}}>
              <Edit size={16} className="mr-2" />
              Edit Profile
            </button>
            <button className={getButtonStyles()} onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className={getCardStyles()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={24} />
            <h2 className="text-xl font-semibold">Account Balance</h2>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-gray-100 rounded-full">
            {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="text-3xl font-bold text-green-600">
          {showBalance ? formatCurrency(buyer.balance) : '••••••'}
        </div>
        <div className="mt-4 flex gap-2">
          <button className={getButtonStyles()}>
            <TrendingUp size={16} className="mr-2" />
            Deposit
          </button>
          <button className={getButtonStyles()}>
            <TrendingDown size={16} className="mr-2" />
            Withdraw
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: <User size={16} /> },
          { id: 'activities', label: 'Activities', icon: <History size={16} /> },
          { id: 'transactions', label: 'Transactions', icon: <Wallet size={16} /> },
          { id: 'interactions', label: 'Interactions', icon: <Star size={16} /> },
          { id: 'contact', label: 'Contact Info', icon: <MessageSquare size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={getButtonStyles(activeTab === tab.id)}>
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={getCardStyles()}>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Package size={16} />
                Total Activities
              </h3>
              <p className="text-2xl font-bold">{activities.length}</p>
            </div>
            <div className={getCardStyles()}>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Wallet size={16} />
                Completed Transactions
              </h3>
              <p className="text-2xl font-bold">{completedTransactions.length}</p>
            </div>
            <div className={getCardStyles()}>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Star size={16} />
                Interactions
              </h3>
              <p className="text-2xl font-bold">{interactionActivities.length}</p>
            </div>
            <div className={getCardStyles()}>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Member Since
              </h3>
              <p className="text-sm">{formatDate(buyer.createdAt)}</p>
            </div>
          </div>
        )}

        {(activeTab === 'activities' ||
          activeTab === 'transactions' ||
          activeTab === 'interactions') && (
          <div className={getCardStyles()}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <History size={20} />
                {activeTab === 'transactions'
                  ? 'Financial Activities'
                  : activeTab === 'interactions'
                  ? 'Interaction Activities'
                  : 'All Activities'}
              </h3>

              {/* Filter Controls */}
              <div className="flex gap-2">
                <select
                  value={activityFilter.category || ''}
                  onChange={(e) =>
                    handleFilterChange({
                      ...activityFilter,
                      category: e.target.value || undefined,
                    })
                  }
                  className="px-3 py-1 border rounded-lg text-sm">
                  <option value="">All Categories</option>
                  <option value="financial">Financial</option>
                  <option value="interaction">Interaction</option>
                  <option value="system">System</option>
                </select>

                <button
                  onClick={() => refetch()}
                  className={cn(getButtonStyles(), 'px-3 py-1')}
                  disabled={activitiesLoading}>
                  <RefreshCw
                    size={14}
                    className={cn('mr-1', activitiesLoading && 'animate-spin')}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {activitiesError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {activitiesError}
              </div>
            )}

            {activitiesLoading && activities.length === 0 ? (
              <div className="text-center py-8">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Loading activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activities found</p>
            ) : (
              <div className="space-y-3">
                {activities
                  .filter((activity) => {
                    if (activeTab === 'transactions') return activity.category === 'financial';
                    if (activeTab === 'interactions') return activity.category === 'interaction';
                    return true;
                  })
                  .map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <p className="text-red-500 font-black">{activity.metadata.ipAddress}</p>
                      <div className="flex items-center gap-3">
                        {getActivityIcon(activity.type, activity.category)}
                        <div>
                          <p className="font-medium">{getActivityDescription(activity)}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            {getStatusIcon(activity.status)}
                            <span className="capitalize">{activity.status}</span>
                            {activity.metadata.comment && (
                              <span className="text-xs">• {activity.metadata.comment}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.metadata.amount && (
                          <p className="font-semibold">
                            {formatCurrency(activity.metadata.amount)}
                          </p>
                        )}
                        {activity.metadata.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={
                                  i < activity.metadata.rating!
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-400">{formatDate(activity.createdAt)}</p>
                      </div>
                    </div>
                  ))}

                {pagination.hasMore && (
                  <div className="text-center pt-4">
                    <button
                      onClick={loadMore}
                      disabled={activitiesLoading}
                      className={cn(getButtonStyles(), 'px-6 py-2')}>
                      {activitiesLoading ? (
                        <>
                          <RefreshCw size={16} className="animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} className="mr-2" />
                          Load More
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className={getCardStyles()}>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare size={20} />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-500" />
                  <span>{buyer.email}</span>
                </div>
                {buyer.contact.facebook && (
                  <div className="flex items-center gap-3">
                    <Facebook size={16} className="text-blue-600" />
                    <a
                      href={`https://${buyer.contact.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline">
                      {buyer.contact.facebook}
                    </a>
                  </div>
                )}
                {buyer.contact.instagram && (
                  <div className="flex items-center gap-3">
                    <Instagram size={16} className="text-pink-600" />
                    <span>{buyer.contact.instagram}</span>
                  </div>
                )}
                {buyer.contact.whatsapp && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-green-600" />
                    <span>{buyer.contact.whatsapp}</span>
                  </div>
                )}
                {buyer.contact.line && (
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-green-500" />
                    <span>{buyer.contact.line}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BuyerDashboard;
