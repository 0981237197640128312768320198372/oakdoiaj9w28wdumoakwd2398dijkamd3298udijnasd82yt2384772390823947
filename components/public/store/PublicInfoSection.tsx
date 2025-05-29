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
  const themeUtils = useThemeUtils(theme);

  const getSectionStyles = () => {
    const isLight = themeUtils.baseTheme === 'light';
    return {
      container: isLight
        ? 'bg-light-100 border-light-300 hover:border-primary/40'
        : 'bg-dark-700 border-dark-500 hover:border-primary/40',

      iconContainer: isLight
        ? 'bg-light-200 border-transparent group-hover:border-primary/70'
        : 'bg-dark-600 border-transparent group-hover:border-primary/70',

      title: isLight ? 'text-dark-800' : 'text-white',

      shadow: 'hover:shadow-sm',
    };
  };

  const sectionStyles = getSectionStyles();

  return (
    <div
      className={cn(
        'group p-4 transition-all duration-300 border-[1px] ',
        themeUtils.getTextColors(),
        themeUtils.getCardClass(),
        themeUtils.getComponentRoundednessClass(),
        className
      )}>
      <div className={cn('flex items-center gap-2 text-xs pb-3 mb-3')}>
        {icon && (
          <div
            className={cn(
              'transition-colors duration-300 text-xs border-[1px] p-1',
              themeUtils.getTextColors(),
              themeUtils.getCardClass(),
              themeUtils.getComponentRoundednessClass()
            )}>
            {icon}
          </div>
        )}
        <h3
          className={cn(
            'tracking-widest  text-xs font-aktivGroteskBlack select-none',
            sectionStyles.title
          )}>
          {title}
        </h3>
      </div>
      <div className="pl-2">{children}</div>
    </div>
  );
}
