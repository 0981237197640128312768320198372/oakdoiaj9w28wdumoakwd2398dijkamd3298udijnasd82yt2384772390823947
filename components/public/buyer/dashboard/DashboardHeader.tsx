/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useBuyerDetailsWithSWR } from '@/hooks/useBuyerDetailsWithSWR';
import type { ThemeType } from '@/types';
import { motion } from 'framer-motion';
import { User, Calendar, Mail, Wallet, Eye, EyeOff, Star } from 'lucide-react';
import { cn, dokmaiCoinSymbol, formatPrice } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { ContactList } from './ContactList';
import Image from 'next/image';
import MenuButton from './MenuButton';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import useSWR from 'swr';

interface Contact {
  facebook?: string;
  line?: string;
  instagram?: string;
  whatsapp?: string;
}

interface Balance {
  _id: string;
  buyerId: string;
  balanceType: string;
  amount: number;
  currency: string;
  status: string;
  lastUpdated: string;
}

interface Buyer {
  _id?: string;
  name: string;
  username?: string;
  email: string;
  avatarUrl?: string;
  contact: Contact;
  balance: Balance | number | null;
  balanceId?: string;
  storeId?: string;
  activities?: string[];
  createdAt: string;
  updatedAt: string;
}

interface DashboardHeaderProps {
  buyer: any;
  theme: ThemeType | null;
  onProfileUpdate: () => void;
  onDepositClick: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  handleEditProfile: () => void;
  handleLogout: () => void;
  handleToggleContactList: () => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (open: boolean) => void;
  showContactList: boolean;
  // Review props
  pendingReviewsCount?: number;
  onReviewClick?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  buyer: initialBuyer,
  theme,
  onProfileUpdate,
  onDepositClick,
  handleEditProfile,
  handleLogout,
  handleToggleContactList,
  onRefresh,
  isRefreshing,
  isEditProfileModalOpen,
  setIsEditProfileModalOpen,
  showContactList,
  pendingReviewsCount = 0,
  onReviewClick,
}) => {
  const { buyer, refreshBuyerDetails } = useBuyerDetailsWithSWR();
  const [localBuyer, setLocalBuyer] = useState(initialBuyer);

  useEffect(() => {
    if (buyer) {
      setLocalBuyer(buyer);
    }
  }, [buyer]);
  const themeUtils = useThemeUtils(theme);
  const [showBalance, setShowBalance] = useState(true);

  const { buyer: authBuyer } = useBuyerAuth();
  const buyerToken = typeof window !== 'undefined' ? localStorage.getItem('buyerToken') : null;
  const balUrl = '/api/v3/balance/info';

  const fetchBalance = async (url: string, token: string, buyerValue: string) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ buyer: buyerValue }),
    });
    if (!res.ok) throw new Error('Failed to fetch balance');
    const data = await res.json();
    return data.balance;
  };

  const { data: balanceData, mutate: mutateBalance } = useSWR(
    buyerToken && authBuyer ? [balUrl, buyerToken, authBuyer.email || authBuyer.username] : null,
    ([url, token, buyerValue]: [string, string, string]) => fetchBalance(url, token, buyerValue),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      dedupingInterval: 60000,
      focusThrottleInterval: 60000,
    }
  );

  const displayedBalance = formatPrice(
    balanceData !== undefined
      ? typeof balanceData === 'object' && balanceData
        ? balanceData.amount
        : typeof balanceData === 'number'
        ? balanceData
        : 0
      : typeof localBuyer.balance === 'object' && localBuyer.balance
      ? localBuyer.balance.amount
      : typeof localBuyer.balance === 'number'
      ? localBuyer.balance
      : 0
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleProfileUpdate = async () => {
    await refreshBuyerDetails();
    if (onProfileUpdate) {
      onProfileUpdate();
    }
  };

  const isLight = themeUtils.baseTheme === 'light';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'border backdrop-blur-sm transition-all duration-300 w-full',
          themeUtils.getCardClass(),
          themeUtils.getComponentRoundednessClass(),
          themeUtils.getComponentShadowClass(),
          themeUtils.getTextColors()
        )}>
        <div className="p-5">
          <div className="flex flex-row gap-5">
            <div className="flex-shrink-0">
              <div className="relative inline-block overflow-hidden rounded-full">
                {localBuyer.avatarUrl ? (
                  <Image
                    src={localBuyer.avatarUrl}
                    alt={localBuyer.name || 'User'}
                    width={20}
                    height={20}
                    className={cn('w-20 h-20 md:w-24 md:h-24 rounded-full')}
                  />
                ) : (
                  <div
                    className={cn(
                      'w-20 h-20 md:w-24 md:h-24 flex items-center justify-center border-2 rounded-full',
                      themeUtils.getPrimaryColorClass('border'),
                      themeUtils.getCardClass()
                    )}>
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex w-full justify-between">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div>
                  <h1 className={cn('text-lg font-bold truncate', themeUtils.getTextColors())}>
                    {localBuyer.name}
                  </h1>
                  {localBuyer.username && (
                    <p className="text-sm opacity-70 mt-0.5">@{localBuyer.username}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs flex items-center gap-1.5">
                      <Mail size={12} className="text-gray-500" />
                      <span className="opacity-70">{localBuyer.email}</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar size={12} className={themeUtils.getTextColors()} />
                      <span className="opacity-70">
                        เป็นสมาชิกตั้งแต่ {formatDate(localBuyer.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <MenuButton
                handleEditProfile={handleEditProfile}
                handleLogout={handleLogout}
                handleToggleContactList={handleToggleContactList}
                theme={theme}
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
              />
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'p-2 rounded-lg',
                  themeUtils.getPrimaryColorClass('bg'),
                  'bg-opacity-10'
                )}>
                <Wallet size={16} className={themeUtils.getPrimaryColorClass('text')} />
              </div>
              <h2 className="text-sm font-semibold">ยอดคงเหลือ</h2>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className={cn(
                'p-1.5 transition-all duration-300 hover:opacity-70',
                themeUtils.getCardClass(),
                themeUtils.getComponentRoundednessClass(),
                'border'
              )}>
              {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <div className="mb-4">
            <motion.div
              key={showBalance ? 'visible' : 'hidden'}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-3xl font-bold">
              <div className="flex items-center">
                <Image
                  src={dokmaiCoinSymbol(isLight)}
                  alt="Dokmai Coin"
                  className="h-6 w-auto"
                  width={50}
                  height={50}
                />
                <span className="ml-2">{showBalance ? displayedBalance : '••••••'}</span>
              </div>
            </motion.div>
            <p className="text-xs text-gray-500 mt-1">ยอดคงเหลือที่ใช้ได้</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onDepositClick}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 p-3 text-lg font-medium transition-all duration-300',
                themeUtils.getButtonRoundednessClass(),
                themeUtils.getPrimaryColorClass('border'),
                themeUtils.getButtonClass()
              )}>
              เติมเงินเลย
            </button>

            {/* Review Notification Button */}
            {pendingReviewsCount > 0 && onReviewClick && (
              <button
                onClick={onReviewClick}
                className={cn(
                  'relative flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-all duration-300',
                  themeUtils.getButtonRoundednessClass(),
                  'bg-yellow-500 hover:bg-yellow-600 text-white border border-yellow-500'
                )}>
                <Star size={16} />
                <span className="hidden sm:inline">รีวิว</span>
                {/* Badge */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingReviewsCount}
                </span>
              </button>
            )}
          </div>

          {showContactList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={cn('border-t pt-5 mt-5', themeUtils.getPrimaryColorClass('border'))}>
              <ContactList buyer={localBuyer} theme={theme} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default DashboardHeader;
