// components/seller/public/PublicStoreProfile.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Info, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { PublicInfoSection } from './PublicInfoSection';
import { useThemeUtils } from '@/lib/theme-utils';

import { PublicStoreHeader } from './PublicStoreHeader';
import { PublicStoreStats } from './PublicStoreStats';
import { SocialLinks } from '@/components/Private/seller/profile/SocialLinks';

interface PublicStoreProfileProps {
  seller: any;
  theme?: any;
}

const PublicStoreProfile: React.FC<PublicStoreProfileProps> = ({ seller, theme }) => {
  const [isVisible, setIsVisible] = useState(false);

  const themeUtils = useThemeUtils(theme);

  const getProfileStyles = () => {
    const isLight = themeUtils.baseTheme === 'light';
    return {
      card: isLight ? 'bg-white text-dark-800' : 'bg-card text-card-foreground',
      PublicInfoSection: isLight ? 'bg-light-100' : 'bg-dark-700',
      text: isLight ? 'text-dark-800' : 'text-light-100',
      secondaryText: isLight ? 'text-dark-600' : 'text-muted-foreground',
    };
  };

  const profileStyles = getProfileStyles();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!seller) {
    return (
      <Card
        className={cn(
          'w-full max-w-screen-lg opacity-0 transition-opacity duration-500',
          themeUtils.getCardClass()
        )}>
        <CardContent className="text-center p-6">
          <p className={profileStyles.secondaryText}>Store information not available</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };
  console.log('PUBLIC STORE PROFILE', theme);
  return (
    <div
      className={cn(
        'w-full max-w-screen-lg transition-all duration-500 transform',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        themeUtils.getTextColors()
      )}>
      <Card className="overflow-hidden mt-10 lg:mt-0 px-5">
        <PublicStoreHeader seller={seller} theme={theme} />
        <CardContent className="p-5 lg:px-0 ">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <PublicInfoSection
                title="Store Information"
                theme={theme}
                icon={<Info className="w-4 h-4" />}>
                <p
                  className={cn(
                    'text-sm leading-relaxed p-3 rounded-md',
                    profileStyles.PublicInfoSection
                  )}>
                  {seller.store.description || 'No description available'}
                </p>
                <div
                  className={cn(
                    'grid grid-cols-1 md:grid-cols-2 gap-4 mt-5',
                    themeUtils.getTextColors()
                  )}>
                  <div className="flex items-center gap-2">
                    <CalendarDays className={cn('h-4 w-4', profileStyles.secondaryText)} />
                    <span className={cn('text-sm', profileStyles.secondaryText)}>
                      Member since:
                    </span>
                    <span className={cn('font-medium text-xs', profileStyles.text)}>
                      {formatDate(seller.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className={cn('h-4 w-4', profileStyles.secondaryText)} />
                    <span className={cn('text-sm', profileStyles.secondaryText)}>
                      Last updated:
                    </span>
                    <span className={cn('font-medium text-xs', profileStyles.text)}>
                      {formatDate(seller.updatedAt)}
                    </span>
                  </div>
                </div>
              </PublicInfoSection>
            </div>

            <div className="space-y-6">
              <PublicStoreStats theme={theme} seller={seller} />
              <PublicInfoSection
                theme={theme}
                title="Contact Information"
                icon={<MessageCircle className="w-4 h-4" />}>
                <SocialLinks contact={seller.contact} />
              </PublicInfoSection>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicStoreProfile;
