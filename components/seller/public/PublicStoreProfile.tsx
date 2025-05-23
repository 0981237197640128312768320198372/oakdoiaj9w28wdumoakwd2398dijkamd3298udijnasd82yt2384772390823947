// components/seller/public/PublicStoreProfile.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Info, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { InfoSection } from '../profile/InfoSection';
import { StoreStats } from '../profile/StoreStats';
import { SocialLinks } from '../profile/SocialLinks';

import { Product, Category } from '@/types';
import SellerCategories from './SellerCategories';
import { PublicStoreHeader } from './PublicStoreHeader';

interface PublicStoreProfileProps {
  seller: any;
  products: Product[];
  categories: Category[];
}

const PublicStoreProfile: React.FC<PublicStoreProfileProps> = ({
  seller,
  products,
  categories,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!seller) {
    return (
      <Card className="w-full max-w-screen-lg opacity-0 transition-opacity duration-500">
        <CardContent className="text-center p-6">
          <p className="text-muted-foreground">Store information not available</p>
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
  return (
    <div
      className={cn(
        'w-full max-w-screen-lg transition-all duration-500 transform',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}>
      <Card className="overflow-hidden bg-card text-card-foreground shadow-lg">
        <PublicStoreHeader seller={seller} />
        <CardContent className="p-5 lg:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <InfoSection title="Store Information" icon={<Info className="h-5 w-5" />}>
                <p className="text-sm leading-relaxed p-3 bg-dark-700 rounded-xl">
                  {seller.store.description || 'No description available'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Member since:</span>
                    <span className="font-medium text-xs">{formatDate(seller.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Last updated:</span>
                    <span className="font-medium text-xs">{formatDate(seller.updatedAt)}</span>
                  </div>
                </div>
              </InfoSection>
              <SellerCategories products={products} categories={categories} />
              {/* Add the new component here */}
            </div>

            <div className="space-y-6">
              <StoreStats seller={seller} />
              <InfoSection title="Contact Information" icon={<MessageCircle className="h-5 w-5" />}>
                <SocialLinks contact={seller.contact} />
              </InfoSection>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicStoreProfile;
