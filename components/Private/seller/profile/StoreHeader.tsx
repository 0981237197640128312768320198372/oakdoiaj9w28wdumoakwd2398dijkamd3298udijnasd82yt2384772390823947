/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Edit, ShoppingCart, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import { cn } from '@/lib/utils';
import { useSellerDashboard } from '@/context/SellerDashboardContext';

interface StoreHeaderProps {
  seller: any;
}

export function StoreHeader({ seller }: StoreHeaderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { activeView, setActiveView } = useSellerDashboard();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (
    view: 'profile' | 'products' | 'orders' | 'analytics' | 'edit-profile'
  ) => {
    setActiveView(view);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 h-40 bg-dark-700 border-[1px] border-dark-500 rounded-3xl" />
      <div className="relative p-5 pt-16 flex items-start gap-5 z-10">
        <div className="relative h-20 w-20 overflow-hidden rounded-full shadow-md border-2 border-primary/10 bg-background transition-all duration-500 hover:scale-105">
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br from-primary/10 to-background/80 z-10 transition-opacity duration-500',
              imageLoaded ? 'opacity-0' : 'opacity-100'
            )}
          />
          <Image
            src={seller.store.logoUrl || dokmailogosquare}
            alt={seller.store.name}
            layout="fill"
            sizes="100"
            className="transition-transform duration-700 ease-out"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        <div className="flex-1 pt-1 ">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            {seller.store.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 select-none">
            <Badge
              variant="outline"
              className="flex items-center gap-2 border-[0.5px] hover:border-yellow-400/50 bg-gradient-to-tr cursor-default from-transparent hover:via-yellow-400/30 via-yellow-400/10 to-transparent from-5% via-55% to-100% transition-all duration-500">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{seller.store.rating.toFixed(1)}</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-2 border-[0.5px] hover:border-fuchsia-400/50 bg-gradient-to-tr cursor-default from-transparent hover:via-fuchsia-400/30 via-fuchsia-400/10 to-transparent from-5% via-55% to-100% transition-all duration-500">
              <ShoppingCart className="h-3 w-3 fill-fuchsia-400 text-fuchsia-400" />
              <span>{seller.store.rating.toFixed(1)}</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-2 border-[0.5px] hover:border-green-500/50 bg-gradient-to-tr cursor-default from-transparent hover:via-green-500/30 via-green-500/10 to-transparent from-5% via-55% to-100% transition-all duration-500">
              <ThumbsUp className="h-3 w-3 text-green-500" />
              <span>{seller.store.credits.positive}</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-2 border-[0.5px] hover:border-rose-500/50 bg-gradient-to-tr cursor-default from-transparent hover:via-rose-500/30 via-rose-500/10 to-transparent from-5% via-55% to-100% transition-all duration-500">
              <ThumbsDown className="h-3 w-3 text-rose-500" />
              <span>{seller.store.credits.negative}</span>
            </Badge>
          </div>
        </div>
        <button
          onClick={() => handleNavigation('edit-profile')}
          className="absolute top-3 right-3 flex gap-2 items-center text-light-200 bg-dark-600 hover:bg-dark-500 px-2 py-1 border-[0.5px] text-xs border-dark-400 rounded-md">
          <Edit size={16} /> Edit Profile
        </button>
      </div>
    </div>
  );
}
