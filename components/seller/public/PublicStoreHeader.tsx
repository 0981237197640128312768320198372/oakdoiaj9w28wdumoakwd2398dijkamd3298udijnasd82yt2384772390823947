/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';

interface PublicStoreHeaderProps {
  seller: any;
  theme?: any;
}

export function PublicStoreHeader({ seller, theme }: PublicStoreHeaderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const themeUtils = useThemeUtils(theme);

  const getHeaderStyles = () => {
    const isLight = themeUtils.baseTheme === 'light';
    return {
      background: isLight ? 'bg-light-200 border-light-300' : 'bg-dark-700 border-dark-500',
      text: isLight ? 'text-dark-800' : 'text-light-100',
      secondaryText: isLight ? 'text-dark-600' : 'text-light-300',
    };
  };

  const headerStyles = getHeaderStyles();

  return (
    <div className="relative">
      <div
        className={cn(
          'absolute inset-0 h-40 border-[1px] ',
          themeUtils.getCardClass(),
          themeUtils.getComponentRoundednessClass()
        )}
      />
      <div className="relative p-5 pt-16 flex items-start gap-5 z-10">
        <div
          className={cn(
            'relative h-20 w-20 overflow-hidden shadow-md border-2 bg-background transition-all duration-500 hover:scale-105',
            themeUtils.getComponentRoundednessClass(),
            `border-${themeUtils.primaryColor}/20`
          )}>
          <div
            className={cn(
              'absolute inset-0 z-10 transition-opacity duration-500',
              `bg-gradient-to-br from-${themeUtils.primaryColor}/10 to-background/80`,
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
        <div className="flex-1 pt-1">
          <h2
            className={cn('text-2xl sm:text-3xl font-bold tracking-tight mb-2', headerStyles.text)}>
            {seller.store.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 select-none ">
            <Badge
              variant="outline"
              className={cn(
                'flex items-center gap-2 border-[1px] hover:border-yellow-500 border-yellow-500/30 bg-gradient-to-tr cursor-default from-transparent hover:via-yellow-400/30 via-yellow-400/10 to-transparent from-5% via-55% to-100% transition-all duration-500',
                themeUtils.getButtonRoundednessClass()
              )}>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className={cn(themeUtils.getTextColors())}>
                {seller.store.rating.toFixed(1)}
              </span>
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'flex items-center gap-2 border-[1px] hover:border-fuchsia-500 border-fuchsia-500/30 bg-gradient-to-tr cursor-default from-transparent hover:via-fuchsia-400/30 via-fuchsia-400/10 to-transparent from-5% via-55% to-100% transition-all duration-500',
                themeUtils.getButtonRoundednessClass()
              )}>
              <ShoppingCart className="h-3 w-3 fill-fuchsia-400 text-fuchsia-400" />
              <span className={cn(themeUtils.getTextColors())}>
                {seller.store.rating.toFixed(1)}
              </span>
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'flex items-center gap-2 border-[1px] hover:border-green-500 border-green-500/30 bg-gradient-to-tr cursor-default from-transparent hover:via-green-500/30 via-green-500/10 to-transparent from-5% via-55% to-100% transition-all duration-500',
                themeUtils.getButtonRoundednessClass()
              )}>
              <ThumbsUp className="h-3 w-3 text-green-500" />
              <span className={cn(themeUtils.getTextColors())}>
                {seller.store.credits.positive}
              </span>
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'flex items-center gap-2 border-[1px] hover:border-rose-500 border-rose-500/30 bg-gradient-to-tr cursor-default from-transparent hover:via-rose-500/30 via-rose-500/10 to-transparent from-5% via-55% to-100% transition-all duration-500',
                themeUtils.getButtonRoundednessClass()
              )}>
              <ThumbsDown className="h-3 w-3 text-rose-500" />
              <span className={cn(themeUtils.getTextColors())}>
                {seller.store.credits.negative}
              </span>
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
