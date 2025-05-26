/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import dokmaiwithtext from '@/assets/images/dokmaiwithtext.png';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import { Search, Home, Package, Info } from 'lucide-react';
import SearchModal from './SearchModal';
import { cn } from '@/lib/utils';
import type { ThemeType } from '@/types';

interface StoreNavbarProps {
  seller: any;
  theme: ThemeType | null;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const StoreNavbar: React.FC<StoreNavbarProps> = ({
  seller,
  theme,
  activePage,
  onNavigate,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = () => {
    setIsSearchOpen(true);
  };

  const baseTheme = theme?.baseTheme || 'dark';
  const primaryColor = theme?.customizations?.colors?.primary || 'primary';
  const secondaryColor = theme?.customizations?.colors?.secondary || 'bg-dark-800';
  const buttonTextColor = theme?.customizations?.button?.textColor || 'text-dark-800';
  const buttonBgColor = theme?.customizations?.button?.backgroundColor || 'bg-primary';
  const buttonRoundedness = theme?.customizations?.button?.roundedness || 'md';
  const buttonShadow = theme?.customizations?.button?.shadow || 'sm';
  const buttonBorder = theme?.customizations?.button?.border || 'none';
  const buttonBorderColor = theme?.customizations?.button?.borderColor || 'border-primary';
  const componentRoundedness = theme?.customizations?.componentStyles?.cardRoundedness || 'md';
  const componentShadow = theme?.customizations?.componentStyles?.cardShadow || 'sm';

  const getButtonRoundednessClass = () => {
    switch (buttonRoundedness) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return 'rounded-sm';
      case 'md':
        return 'rounded-md';
      case 'lg':
        return 'rounded-lg';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-full';
    }
  };

  const getComponentRoundednessClass = () => {
    switch (componentRoundedness) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return 'rounded-sm';
      case 'md':
        return 'rounded-md';
      case 'lg':
        return 'rounded-lg';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-full';
    }
  };

  const getButtonShadowClass = () => {
    switch (buttonShadow) {
      case 'none':
        return 'shadow-none';
      case 'sm':
        return 'shadow-sm';
      case 'md':
        return 'shadow-md';
      case 'lg':
        return 'shadow-lg';
      default:
        return 'shadow-sm';
    }
  };

  const getComponentShadowClass = () => {
    switch (componentShadow) {
      case 'none':
        return 'shadow-none';
      case 'sm':
        return 'shadow-sm';
      case 'md':
        return 'shadow-md';
      case 'lg':
        return 'shadow-lg';
      default:
        return 'shadow-sm';
    }
  };

  const getButtonBorderClass = () => {
    if (buttonBorder === 'none') return 'border-0';

    const borderWidth =
      {
        sm: 'border',
        md: 'border-2',
        lg: 'border-4',
      }[buttonBorder] || 'border';

    return `${borderWidth} ${buttonBorderColor}`;
  };

  const getNavbarBgClass = () => {
    return baseTheme === 'light' ? 'bg-white/90 border-light-200' : 'bg-dark-700 border-dark-500';
  };

  const getNavbarTextClass = () => {
    return baseTheme === 'light' ? 'text-dark-800' : 'text-light-100';
  };

  const getSearchButtonBgClass = () => {
    return baseTheme === 'light'
      ? 'bg-light-200 hover:bg-light-300 duration-300 transition-all text-dark-500 shadow-md'
      : 'bg-dark-600 hover:bg-dark-500 duration-300 transition-all text-light-300 border-[1px] border-dark-400 shadow-md';
  };

  const getStoreBadgeBgClass = () => {
    return baseTheme === 'light'
      ? 'border-light-200 hover:bg-light-200 hover:border-light-400'
      : 'bg-dark-700 border-dark-600 hover:bg-dark-600 hover:border-dark-500';
  };

  const getMobileNavBgClass = () => {
    return baseTheme === 'light'
      ? 'bg-white/5 border-light-400/50 shadow shadow-black/20'
      : 'bg-dark-800/5 border-dark-500 shadow-black';
  };

  return (
    <>
      <nav className="fixed text-xs font-aktivGroteskRegular flex flex-col px-5 xl:p-0 items-center justify-center top-0 left-0 w-full transition-transform duration-500 z-50 transform">
        <div
          className={cn(
            'w-full mt-5 gap-4 border-[1px] flex p-2 max-w-screen-lg justify-between duration-1000 items-center backdrop-blur-sm',
            getNavbarBgClass(),
            getComponentShadowClass(),
            getComponentRoundednessClass()
          )}>
          <div
            className={cn(
              'flex items-center gap-2 w-fit select-none group transition-all duration-500',
              getNavbarTextClass()
            )}>
            {seller ? (
              <>
                <div
                  className={cn(
                    'relative w-10 h-10 overflow-hidden bg-cover bg-center',
                    getComponentRoundednessClass(),
                    getButtonRoundednessClass()
                  )}>
                  <Image
                    src={seller.store.logoUrl || dokmailogosquare}
                    alt={seller.store.name}
                    width={100}
                    height={100}
                    className={cn(
                      'w-full h-full overflow-hidden',
                      getComponentRoundednessClass(),
                      getButtonRoundednessClass()
                    )}
                  />
                </div>
              </>
            ) : (
              <>
                <Image
                  width={100}
                  height={100}
                  src={dokmaiwithtext || '/placeholder.svg'}
                  loading="lazy"
                  alt="Logo of Dokmai Store"
                  className="duration-700 hidden max-xl:h-10 max-xl:w-auto xl:block"
                />
                <Image
                  width={60}
                  height={60}
                  src={dokmailogosquare || '/placeholder.svg'}
                  loading="lazy"
                  alt="Logo of Dokmai Store"
                  className="duration-700 max-xl:h-10 max-xl:w-auto xl:hidden"
                />
              </>
            )}
            {seller && (
              <h1
                className={cn(
                  'font-aktivGroteskBold select-none text-xs shadow px-2 py-1 border-[1px] tracking-widest transition-all duration-500',
                  getStoreBadgeBgClass(),
                  getNavbarTextClass(),
                  getButtonRoundednessClass()
                )}>
                {seller.store.name}
              </h1>
            )}
          </div>

          <div className="items-center gap-2 hidden md:flex">
            <NavButton
              icon={<Home size={18} />}
              label="Home"
              isActive={activePage === 'home'}
              onClick={() => onNavigate('home')}
              theme={theme}
            />
            <NavButton
              icon={<Info size={18} />}
              label="Profile"
              isActive={activePage === 'profile'}
              onClick={() => onNavigate('profile')}
              theme={theme}
            />
            <NavButton
              icon={<Package size={18} />}
              label="Products"
              isActive={activePage === 'products'}
              onClick={() => onNavigate('products')}
              theme={theme}
            />
          </div>

          <button
            onClick={handleSearch}
            className={cn(
              'flex whitespace-nowrap me-1 justify-between items-center py-1 px-3 w-fit gap-10',
              getSearchButtonBgClass(),
              getButtonRoundednessClass()
            )}>
            Search Anything
            <Search size={18} />
          </button>
        </div>
      </nav>

      <div className="fixed text-xs flex flex-col px-5 items-center justify-center bottom-0 left-0 w-full transition-transform duration-500 z-50 transform md:hidden">
        <div
          className={cn(
            'w-fit mb-10 gap-5 backdrop-blur border-[1px] flex p-3 max-w-screen-lg justify-between duration-1000 items-center',
            getMobileNavBgClass(),
            getComponentRoundednessClass(),
            getComponentShadowClass()
          )}>
          <NavButton
            className="!p-3"
            icon={<Home size={24} />}
            label="Home"
            isActive={activePage === 'home'}
            onClick={() => onNavigate('home')}
            theme={theme}
          />
          <NavButton
            className="!p-3"
            icon={<Info size={24} />}
            label="Profile"
            isActive={activePage === 'profile'}
            onClick={() => onNavigate('profile')}
            theme={theme}
          />
          <NavButton
            className="!p-3"
            icon={<Package size={24} />}
            label="Products"
            isActive={activePage === 'products'}
            onClick={() => onNavigate('products')}
            theme={theme}
          />
        </div>
      </div>

      {seller && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          storeUsername={seller.username}
        />
      )}
    </>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
  isActive: boolean;
  onClick: () => void;
  theme: ThemeType | null;
}

const NavButton: React.FC<NavButtonProps> = ({
  icon,
  label,
  isActive,
  className,
  onClick,
  theme,
}) => {
  // Get theme values with fallbacks
  const baseTheme = theme?.baseTheme || 'dark';
  const primaryColor = theme?.customizations?.colors?.primary || 'primary';
  const buttonTextColor = theme?.customizations?.button?.textColor || 'text-dark-800';
  const buttonBgColor = theme?.customizations?.button?.backgroundColor || 'bg-primary';
  const buttonRoundedness = theme?.customizations?.button?.roundedness || 'md';
  const buttonShadow = theme?.customizations?.button?.shadow || 'sm';
  const buttonBorder = theme?.customizations?.button?.border || 'none';
  const buttonBorderColor = theme?.customizations?.button?.borderColor || 'border-primary';

  const getButtonRoundednessClass = () => {
    switch (buttonRoundedness) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return 'rounded-sm';
      case 'md':
        return 'rounded-md';
      case 'lg':
        return 'rounded-lg';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-full';
    }
  };

  const getButtonShadowClass = () => {
    switch (buttonShadow) {
      case 'none':
        return 'shadow-none';
      case 'sm':
        return 'shadow-sm';
      case 'md':
        return 'shadow-md';
      case 'lg':
        return 'shadow-lg';
      default:
        return 'shadow-sm';
    }
  };

  const getButtonBorderClass = () => {
    if (buttonBorder === 'none') return 'border-0';

    const borderWidth =
      {
        sm: 'border',
        md: 'border-2',
        lg: 'border-4',
      }[buttonBorder] || 'border';

    return `${borderWidth} border-${buttonBorderColor}`;
  };

  const buildColorClass = (colorValue: string, type: 'bg' | 'text' | 'border') => {
    if (colorValue === 'primary') {
      return type === 'bg' ? 'bg-primary' : type === 'text' ? 'text-primary' : 'border-primary';
    }

    if (colorValue.startsWith(`${type}-`)) {
      return colorValue;
    }

    return `${type}-${colorValue}`;
  };

  const getActiveButtonClass = () => {
    const bgClass = buildColorClass(buttonBgColor, 'bg');
    const textClass = buildColorClass(buttonTextColor, 'text');
    const borderClass = getButtonBorderClass();
    const shadowClass = getButtonShadowClass();

    return cn(bgClass, textClass, 'font-medium', shadowClass, borderClass);
  };

  const getInactiveButtonClass = () => {
    if (baseTheme === 'light') {
      return 'bg-light-200 text-dark-600 hover:bg-light-200 hover:text-dark-800 shadow border-light-200';
    }
    return 'bg-dark-600 text-light-300 hover:bg-dark-500 hover:text-light-100';
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 transition-all duration-200 border-[1px]',
        getButtonRoundednessClass(),
        isActive ? getActiveButtonClass() : getInactiveButtonClass(),
        className
      )}>
      {icon}
      <span className="hidden md:inline text-sm">{label}</span>
    </button>
  );
};
