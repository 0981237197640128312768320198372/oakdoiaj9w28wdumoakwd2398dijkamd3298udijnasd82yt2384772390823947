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
import { useThemeUtils } from '@/lib/theme-utils';

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

  // Replace all the existing theme extraction and helper functions with:
  const themeUtils = useThemeUtils(theme);
  const navbarStyles = themeUtils.getNavbarStyles();

  return (
    <>
      <nav className="fixed text-xs font-aktivGroteskRegular flex flex-col px-5 xl:p-0 items-center justify-center top-0 left-0 w-full transition-transform duration-500 z-50 transform">
        <div
          className={cn(
            'w-full mt-5 gap-4 border-[1px] flex p-2 max-w-screen-lg justify-between duration-1000 items-center backdrop-blur-sm',
            navbarStyles.background,
            themeUtils.getComponentShadowClass(),
            themeUtils.getComponentRoundednessClass()
          )}>
          <div
            className={cn(
              'flex items-center gap-2 w-fit select-none group transition-all duration-500',
              navbarStyles.text
            )}>
            {seller ? (
              <>
                <div
                  className={cn(
                    'relative w-10 h-10 overflow-hidden bg-cover bg-center',
                    themeUtils.getComponentRoundednessClass(),
                    themeUtils.getButtonRoundednessClass()
                  )}>
                  <Image
                    src={seller.store.logoUrl || dokmailogosquare}
                    alt={seller.store.name}
                    width={100}
                    height={100}
                    className={cn(
                      'w-full h-full overflow-hidden',
                      themeUtils.getComponentRoundednessClass(),
                      themeUtils.getButtonRoundednessClass()
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
                  navbarStyles.storeBadge,
                  navbarStyles.text,
                  themeUtils.getButtonRoundednessClass()
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
              navbarStyles.searchButton,
              themeUtils.getButtonRoundednessClass()
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
            navbarStyles.mobileNav,
            themeUtils.getComponentRoundednessClass(),
            themeUtils.getComponentShadowClass()
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
  const themeUtils = useThemeUtils(theme);

  const getActiveButtonClass = () => {
    return themeUtils.getButtonClass('primary');
  };

  const getInactiveButtonClass = () => {
    return themeUtils.getButtonClass('secondary');
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 transition-all duration-200 border-[1px]',
        themeUtils.getButtonRoundednessClass(),
        isActive ? getActiveButtonClass() : getInactiveButtonClass(),
        className
      )}>
      {icon}
      <span className="hidden md:inline text-sm">{label}</span>
    </button>
  );
};
