/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';

import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';

interface PublicInfoSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  theme?: any;
}

export function PublicInfoSection({
  title,
  icon,
  children,
  className,
  theme,
}: PublicInfoSectionProps) {
  // Use the centralized theme utility
  const themeUtils = useThemeUtils(theme);
  console.log(theme);
  const getSectionStyles = () => {
    const isLight = themeUtils.baseTheme === 'light';
    return {
      // Main container styles
      container: isLight
        ? 'bg-light-100 border-light-300 hover:border-primary/40'
        : 'bg-dark-700 border-dark-500 hover:border-primary/40',

      // Icon container styles
      iconContainer: isLight
        ? 'bg-light-200 border-transparent group-hover:border-primary/70'
        : 'bg-dark-600 border-transparent group-hover:border-primary/70',

      // Text styles
      title: isLight ? 'text-dark-800' : 'text-white',

      // Shadow styles
      shadow: 'hover:shadow-sm',
    };
  };

  const sectionStyles = getSectionStyles();

  return (
    <div
      className={cn(
        'group p-4 transition-all duration-300 border-[1px]',
        themeUtils.getCardClass(),
        className
      )}>
      <div className="flex items-center gap-2 mb-5">
        {icon && (
          <div
            className={cn(
              'transition-colors duration-300 border-[1px] w-fit p-2',
              themeUtils.getButtonRoundednessClass(),
              themeUtils.getTextColors()
            )}>
            {icon}
          </div>
        )}
        <h3 className={cn('tracking-widest font-aktivGroteskBlack', sectionStyles.title)}>
          {title}
        </h3>
      </div>
      <div className="pl-2">{children}</div>
    </div>
  );
}
