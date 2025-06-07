/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import { Search, Home, Package, LogOut, Power, ShoppingCart } from 'lucide-react';
import CartButton from './CartButton';
import SearchModal from './SearchModal';
import { cn } from '@/lib/utils';
import type { ThemeType } from '@/types';
import { useThemeUtils } from '@/lib/theme-utils';
import { CircleUserRound } from 'lucide-react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TbInfoHexagon } from 'react-icons/tb';

interface StoreNavbarProps {
  seller: any;
  theme: ThemeType | null;
  activePage: string;
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
  onCartOpen: () => void;
}

export const StoreNavbar: React.FC<StoreNavbarProps> = ({
  seller,
  theme,
  activePage,
  onNavigate,
  isAuthenticated,
  onCartOpen,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { buyer, logout } = useBuyerAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    setIsSearchOpen(true);
  };

  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed flex flex-col px-5 xl:p-0 items-center justify-center top-0 left-0 w-full transition-transform duration-500 z-50 transformed font-aktivGroteskRegular">
        <div
          className={cn(
            'border transition-all backdrop-blur w-full mt-5 gap-10 flex py-1 px-2 lg:p-2 max-w-screen-lg justify-between duration-1000 items-center',
            isLight ? 'bg-white/65 border-light-200' : 'bg-dark-600/65 border-dark-400',
            themeUtils.getButtonRoundednessClass()
          )}>
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 ">
            <div
              className={cn(
                'relative overflow-hidden transition-all duration-300 w-10 h-10 ',
                themeUtils.getButtonRoundednessClass()
              )}>
              <Image
                src={seller?.store?.logoUrl || dokmailogosquare}
                alt={seller?.store?.name || 'Dokmai'}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
            {seller && (
              <div className="flex flex-col">
                <h1
                  className={cn(
                    'font-aktivGroteskBold text-sm tracking-wide transition-all duration-300 select-none',
                    isLight ? 'text-gray-800' : 'text-white'
                  )}>
                  {seller.store.name}
                </h1>
              </div>
            )}
          </button>

          <div className="items-center gap-1 hidden md:flex">
            <NavButton
              icon={<Home size={16} />}
              label="บ้าน"
              isActive={activePage === 'home'}
              onClick={() => onNavigate('home')}
              theme={theme}
            />
            <NavButton
              icon={<TbInfoHexagon size={16} />}
              label="ร้านค้า"
              isActive={activePage === 'profile'}
              onClick={() => onNavigate('profile')}
              theme={theme}
            />
            <NavButton
              icon={<Package size={16} />}
              label="สินค้า"
              isActive={activePage === 'products'}
              onClick={() => onNavigate('products')}
              theme={theme}
            />
          </div>

          <div className="flex items-center gap-2">
            <CartButton onClick={onCartOpen} theme={theme} />

            <button
              onClick={handleSearch}
              className={cn(
                'flex items-center justify-center transition-all duration-300 p-2 group',
                isLight ? 'hover:bg-light-300 bg-light-100' : 'hover:bg-dark-500 bg-dark-600',
                themeUtils.getButtonRoundednessClass()
              )}
              aria-label="ค้นหา">
              <Search
                size={18}
                className={
                  isLight
                    ? 'text-dark-600 group-hover:text-dark-800'
                    : 'text-light-500 group-hover:text-light-100'
                }
              />
            </button>

            <AnimatePresence mode="wait">
              {isAuthenticated ? (
                <motion.div
                  key="authenticated"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('buyerdashboard')}
                    className={cn(
                      'flex items-center gap-2 p-2 transition-all duration-300 text-sm',
                      themeUtils.getPrimaryColorClass('border'),
                      activePage === 'buyerdashboard'
                        ? themeUtils.getButtonClass()
                        : isLight
                        ? 'hover:bg-light-300 bg-light-100'
                        : 'hover:bg-dark-500 bg-dark-600',
                      themeUtils.getButtonRoundednessClass()
                    )}>
                    <CircleUserRound size={16} />
                    <span className="hidden lg:inline font-medium truncate max-w-[100px]">
                      {buyer?.name?.split(' ')[0] || 'Dashboard'}
                    </span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="unauthenticated"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('authbuyer')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 transition-all duration-300 text-sm',
                      themeUtils.getPrimaryColorClass('bg'),
                      themeUtils.getButtonClass(),
                      themeUtils.getButtonRoundednessClass(),
                      themeUtils.getPrimaryColorClass('border')
                    )}>
                    <Power size={16} />
                    <span className="hidden lg:inline font-medium">เข้าสู่ระบบ</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      <div className="fixed flex flex-col px-5 items-center justify-center bottom-0 left-0 w-full z-50 transform md:hidden">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={cn(
            'mb-6 border backdrop-blur flex items-center justify-around shadow-lg',
            isLight
              ? 'bg-light-500/20 border-light-300 shadow-black/20'
              : 'bg-dark-100/20 border-dark-300 shadow-black',
            'rounded-full w-auto',
            themeUtils.getButtonRoundednessClass()
          )}>
          <MobileNavButton
            icon={<Home size={20} />}
            isActive={activePage === 'home'}
            onClick={() => onNavigate('home')}
            theme={theme}
            label="บ้าน"
          />
          <MobileNavButton
            icon={<TbInfoHexagon size={20} />}
            isActive={activePage === 'profile'}
            onClick={() => onNavigate('profile')}
            theme={theme}
            label="ร้านค้า"
          />
          <MobileNavButton
            icon={<Package size={20} />}
            isActive={activePage === 'products'}
            onClick={() => onNavigate('products')}
            theme={theme}
            label="สินค้า"
          />
        </motion.div>
      </div>

      {seller && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          storeUsername={seller.username}
          theme={theme}
        />
      )}
    </>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label?: string;
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
  const isLight = themeUtils.baseTheme === 'light';

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 text-sm transition-all duration-300 relative',
        themeUtils.getButtonRoundednessClass(),
        themeUtils.getPrimaryColorClass('border'),
        isActive
          ? themeUtils.getButtonClass()
          : isLight
          ? 'text-gray-700 hover:bg-gray-100'
          : 'text-gray-300 hover:bg-dark-700',

        className
      )}>
      {icon}
      {label && <span className="font-medium">{label}</span>}
    </button>
  );
};

interface MobileNavButtonProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  theme: ThemeType | null;
  label: string;
}

const MobileNavButton: React.FC<MobileNavButtonProps> = ({
  icon,
  isActive,
  onClick,
  theme,
  label,
}) => {
  const themeUtils = useThemeUtils(theme);

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col  transition-all duration-500 items-center justify-center relative p-3 ',
        themeUtils.getButtonRoundednessClass(),
        isActive && themeUtils.getButtonClass() + ' ' + themeUtils.getPrimaryColorClass('border')
      )}
      aria-label={label}>
      <div className="flex flex-col justify-center items-center px-3 gap-1">
        {icon}
        <span className={cn('text-[9px] font-medium transition-all duration-300')}>{label}</span>
      </div>
    </button>
  );
};
