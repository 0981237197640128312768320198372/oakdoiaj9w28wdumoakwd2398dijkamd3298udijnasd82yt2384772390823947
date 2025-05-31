'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useBuyerDetailsWithSWR } from '@/hooks/useBuyerDetailsWithSWR';
import { motion } from 'framer-motion';
import {
  Edit,
  User,
  MessageSquare,
  Calendar,
  Mail,
  Wallet,
  Eye,
  EyeOff,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';
import { ContactInfo } from './ContactInfo';
import { EditProfileModal } from './EditProfileModal';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Contact {
  facebook?: string;
  line?: string;
  instagram?: string;
  whatsapp?: string;
}

interface Buyer {
  _id?: string;
  name: string;
  username?: string;
  email: string;
  avatarUrl?: string;
  contact: Contact;
  balance: number;
  storeId?: string;
  activities?: string[];
  createdAt: string;
  updatedAt: string;
}

interface DashboardHeaderProps {
  buyer: Buyer;
  theme: ThemeType | null;
  onProfileUpdate?: () => void;
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  buyer: initialBuyer,
  theme,
  onProfileUpdate,
}) => {
  const { buyer, refreshBuyerDetails } = useBuyerDetailsWithSWR();
  const [localBuyer, setLocalBuyer] = useState(initialBuyer);

  // Use the buyer from SWR if available, otherwise use the prop
  useEffect(() => {
    if (buyer) {
      setLocalBuyer(buyer);
    }
  }, [buyer]);
  const themeUtils = useThemeUtils(theme);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

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

  const hasContactMethods =
    localBuyer.contact &&
    (localBuyer.contact.facebook ||
      localBuyer.contact.line ||
      localBuyer.contact.instagram ||
      localBuyer.contact.whatsapp);

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
        {/* Header Section */}
        <div className="p-5 ">
          <div className="flex flex-row gap-5">
            {/* Avatar and Status Section */}
            <div className="flex-shrink-0">
              <div className="relative inline-block">
                <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2 shadow-md">
                  {localBuyer.avatarUrl ? (
                    <AvatarImage
                      src={localBuyer.avatarUrl}
                      alt={localBuyer.name || 'User'}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                      {localBuyer.name?.charAt(0)?.toUpperCase() || <User className="w-8 h-8" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute -bottom-0 -right-0 w-3 h-3 rounded-full bg-green-500 border-2 flex items-center justify-center"></div>
              </div>
            </div>

            <div className="flex w-full justify-between">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 ">
                <div>
                  <h1 className={cn('text-lg font-bold truncate', themeUtils.getTextColors())}>
                    {localBuyer.name}
                  </h1>

                  {localBuyer.username && (
                    <p className="text-sm opacity-70 mt-0.5">@{localBuyer.username}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs  flex items-center gap-1.5">
                      <Mail size={12} className="text-gray-500" />
                      <span className="opacity-70">{localBuyer.email}</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-xs ">
                      <Calendar size={12} className="text-purple-500" />
                      <span className="opacity-70">
                        Member since {formatDate(localBuyer.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 ">
                {/* Only show All Contacts button if there are contact methods available */}
                {hasContactMethods && (
                  <button
                    onClick={() => setShowContactInfo(!showContactInfo)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:opacity-90',
                      themeUtils.getCardClass(),
                      themeUtils.getComponentRoundednessClass(),
                      'border hover:shadow-sm'
                    )}>
                    <MessageSquare size={14} />
                    <span className="hidden sm:inline">
                      {showContactInfo ? 'Hide Contact' : 'All Contacts'}
                    </span>
                  </button>
                )}
                <button
                  data-edit-profile
                  onClick={() => setIsEditModalOpen(true)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:opacity-90',
                    themeUtils.getButtonClass(),
                    themeUtils.getComponentRoundednessClass(),
                    'hover:shadow-sm'
                  )}>
                  <Edit size={14} />
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Card Section */}
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
              <h2 className="text-sm font-semibold">Account Balance</h2>
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
              className="text-2xl font-bold text-green-600 ">
              {showBalance ? formatCurrency(localBuyer.balance || 0) : '••••••'}
            </motion.div>
            <p className="text-xs text-gray-500 mt-1">Available for transactions</p>
          </div>

          <div className="flex gap-2">
            <button
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium transition-all duration-300',
                'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100',
                themeUtils.getComponentRoundednessClass()
              )}>
              <TrendingUp size={14} />
              Deposit
            </button>
          </div>
        </div>

        {/* Contact Info Section */}
        {showContactInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t ">
            <ContactInfo buyer={localBuyer} theme={theme} />
          </motion.div>
        )}
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        buyer={localBuyer}
        theme={theme}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleProfileUpdate}
      />
    </>
  );
};
