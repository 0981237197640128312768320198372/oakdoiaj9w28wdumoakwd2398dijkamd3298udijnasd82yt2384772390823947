'use client';

import type React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import {
  Search,
  Home,
  Package,
  LogOut,
  Power,
  User,
  ChevronDown,
  ShoppingCart,
} from 'lucide-react';
import CartButton from './CartButton';
import SearchModal from './SearchModal';
import { cn } from '@/lib/utils';
import type { ThemeType, Seller } from '@/types';
import { useThemeUtils } from '@/lib/theme-utils';
import { CircleUserRound } from 'lucide-react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TbInfoHexagon } from 'react-icons/tb';
import { useCart } from '@/context/CartContext';

interface StoreNavbarProps {
  seller: Seller;
  theme: ThemeType | null;
  activePage: string;
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
  onCartOpen: () => void;
}

interface NavButtonProps {
  icon: React.ReactNode;
  label?: string;
  className?: string;
  isActive: boolean;
  onClick: () => void;
  theme: ThemeType | null;
}

interface MobileNavButtonProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  theme: ThemeType | null;
  label: string;
}

interface MobileCartButtonProps {
  onClick: () => void;
  theme: ThemeType | null;
  label: string;
}

interface MobileAccountButtonProps {
  isAuthenticated: boolean;
  onClick: () => void;
  theme: ThemeType | null;
  label: string;
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { buyer, logout } = useBuyerAuth();

  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  // Memoize navigation items for better performance
  const navigationItems = useMemo(
    () => [
      {
        id: 'home',
        icon: <Home size={16} />,
        label: 'หน้าหลัก',
        page: 'home',
      },
      {
        id: 'profile',
        icon: <TbInfoHexagon size={16} />,
        label: 'เกี่ยวกับร้าน',
        page: 'profile',
      },
      {
        id: 'products',
        icon: <Package size={16} />,
        label: 'สินค้าทั้งหมด',
        page: 'products',
      },
    ],
    []
  );

  // Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to open search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }

      // Escape to close user menu
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-user-menu]')) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const handleSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleUserMenuToggle = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  // Memoize navbar styles for performance
  const navbarStyles = useMemo(
    () => ({
      container: cn(
        'border transition-all backdrop-blur-md w-full mt-5 gap-4 lg:gap-10 flex py-2 px-3 lg:p-3 max-w-screen-lg justify-between duration-500 items-center shadow-lg',
        scrolled ? 'shadow-xl' : 'shadow-lg',
        isLight ? 'bg-white/80 border-light-200/50' : 'bg-dark-600/80 border-dark-400/50',
        themeUtils.getButtonRoundednessClass()
      ),
      logo: cn(
        'relative overflow-hidden transition-all duration-300 w-10 h-10 lg:w-12 lg:h-12 ring-2 ring-transparent hover:ring-primary/20',
        themeUtils.getButtonRoundednessClass()
      ),
      storeName: cn(
        'font-aktivGroteskBold text-sm lg:text-base tracking-wide transition-all duration-300 select-none truncate max-w-[120px] lg:max-w-[200px]',
        isLight ? 'text-gray-800' : 'text-white'
      ),
      searchButton: cn(
        'flex items-center justify-center transition-all duration-300 p-2.5 group relative',
        'hover:scale-105 active:scale-95',
        isLight ? 'hover:bg-light-300 bg-light-100' : 'hover:bg-dark-500 bg-dark-600',
        themeUtils.getButtonRoundednessClass()
      ),
      mobileNav: cn(
        'fixed flex backdrop-blur-md items-center justify-between bottom-0 left-0 w-full z-50 transform md:hidden border-t',
        isLight
          ? 'bg-white/90 border-light-300 shadow-lg shadow-black/10'
          : 'bg-dark-700/90 border-dark-300 shadow-lg shadow-black/20'
      ),
    }),
    [scrolled, isLight, themeUtils]
  );

  return (
    <>
      {/* Main Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed flex flex-col px-5 xl:p-0 items-center justify-center top-0 left-0 w-full transition-transform duration-500 z-50 font-aktivGroteskRegular"
        role="navigation"
        aria-label="หลัก">
        <div className={navbarStyles.container}>
          {/* Store Logo & Name */}
          <motion.button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`กลับไปหน้าหลักของ ${seller?.store?.name || 'ร้านค้า'}`}>
            <div className={navbarStyles.logo}>
              <Image
                src={seller?.store?.logoUrl || dokmailogosquare}
                alt={`โลโก้ ${seller?.store?.name || 'Dokmai'}`}
                width={48}
                height={48}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                priority
              />
            </div>
            {seller && (
              <div className="flex flex-col items-start">
                <h1 className={navbarStyles.storeName}>{seller.store.name}</h1>
                {seller.store.rating ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            'text-xs',
                            i < Math.floor(seller.store.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          )}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className={cn('text-xs', isLight ? 'text-gray-600' : 'text-gray-400')}>
                      ({seller.store.rating.toFixed(1)})
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </motion.button>

          {/* Desktop Navigation */}
          <div className="items-center gap-1 hidden md:flex">
            {navigationItems.map((item) => (
              <NavButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activePage === item.page}
                onClick={() => onNavigate(item.page)}
                theme={theme}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Cart Button - Hidden on mobile since it's in mobile nav */}
            <div className="hidden md:block">
              <CartButton onClick={onCartOpen} theme={theme} />
            </div>

            {/* Search Button */}
            <motion.button
              onClick={handleSearch}
              className={navbarStyles.searchButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="ค้นหาสินค้า (Ctrl+K)">
              <Search
                size={18}
                className={cn(
                  'transition-colors duration-300',
                  isLight
                    ? 'text-dark-600 group-hover:text-dark-800'
                    : 'text-light-500 group-hover:text-light-100'
                )}
              />
              {/* Keyboard shortcut hint */}
              <div
                className={cn(
                  'absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap',
                  isLight ? 'bg-dark-800 text-white' : 'bg-light-100 text-dark-800'
                )}>
                Ctrl+K
              </div>
            </motion.button>

            {/* User Authentication - Hidden on mobile since it's in mobile nav */}
            <div className="hidden md:block">
              <AnimatePresence mode="wait">
                {isAuthenticated ? (
                  <motion.div
                    key="authenticated"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                    data-user-menu>
                    <motion.button
                      onClick={handleUserMenuToggle}
                      className={cn(
                        'flex items-center gap-2 p-2 lg:p-2.5 transition-all duration-300 text-sm relative',
                        themeUtils.getPrimaryColorClass('border'),
                        isUserMenuOpen || activePage === 'buyerdashboard'
                          ? themeUtils.getButtonClass()
                          : isLight
                          ? 'hover:bg-light-300 bg-light-100'
                          : 'hover:bg-dark-500 bg-dark-600',
                        themeUtils.getButtonRoundednessClass()
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label="เมนูผู้ใช้"
                      aria-expanded={isUserMenuOpen}>
                      <CircleUserRound size={16} />
                      <span className="hidden lg:inline font-medium truncate max-w-[100px]">
                        {buyer?.name?.split(' ')[0] || buyer?.username}
                      </span>
                      <ChevronDown
                        size={14}
                        className={cn(
                          'transition-transform duration-200 hidden lg:block',
                          isUserMenuOpen ? 'rotate-180' : ''
                        )}
                      />
                    </motion.button>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            'absolute right-0 top-full mt-2 w-48 py-2 shadow-xl border z-50',
                            isLight ? 'bg-white border-light-200' : 'bg-dark-700 border-dark-500',
                            themeUtils.getComponentRoundednessClass()
                          )}>
                          <div
                            className={cn(
                              'px-4 py-2 border-b',
                              isLight ? 'border-light-200' : 'border-dark-500'
                            )}>
                            <p
                              className={cn(
                                'font-medium text-sm',
                                isLight ? 'text-dark-800' : 'text-light-100'
                              )}>
                              {buyer?.name || buyer?.username}
                            </p>
                            {buyer?.balance !== undefined && buyer?.balance !== null && (
                              <p
                                className={cn(
                                  'text-xs',
                                  isLight ? 'text-dark-600' : 'text-light-400'
                                )}>
                                ยอดเงิน: {buyer.balance.amount.toLocaleString()}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              onNavigate('buyerdashboard');
                              setIsUserMenuOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200',
                              isLight
                                ? 'hover:bg-light-100 text-dark-700'
                                : 'hover:bg-dark-600 text-light-200'
                            )}>
                            <User size={16} />
                            แดชบอร์ด
                          </button>

                          <button
                            onClick={handleLogout}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            )}>
                            <LogOut size={16} />
                            ออกจากระบบ
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="unauthenticated"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2">
                    <motion.button
                      onClick={() => onNavigate('authbuyer')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 transition-all duration-300 text-sm font-medium',
                        themeUtils.getButtonClass(),
                        themeUtils.getButtonRoundednessClass()
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      <Power size={16} />
                      <span className="hidden lg:inline">เข้าสู่ระบบ</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={navbarStyles.mobileNav}>
        {navigationItems.map((item) => (
          <MobileNavButton
            key={item.id}
            icon={item.icon}
            isActive={activePage === item.page}
            onClick={() => onNavigate(item.page)}
            theme={theme}
            label={item.label}
          />
        ))}

        {/* Mobile Cart Button */}
        <MobileCartButton onClick={onCartOpen} theme={theme} label="ตะกร้า" />

        {/* Mobile Account Button */}
        <MobileAccountButton
          isAuthenticated={isAuthenticated}
          onClick={() => (isAuthenticated ? onNavigate('buyerdashboard') : onNavigate('authbuyer'))}
          theme={theme}
          label={isAuthenticated ? 'บัญชี' : 'เข้าสู่ระบบ'}
        />
      </motion.div>

      {/* Search Modal */}
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
    <motion.button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 text-sm transition-all duration-300 relative font-medium',
        themeUtils.getButtonRoundednessClass(),
        themeUtils.getPrimaryColorClass('border'),
        isActive
          ? themeUtils.getButtonClass()
          : isLight
          ? 'text-gray-700 hover:bg-gray-100 border-transparent'
          : 'text-gray-300 hover:bg-dark-700 border-transparent',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={label}>
      {icon}
      {label && <span>{label}</span>}
    </motion.button>
  );
};

const MobileNavButton: React.FC<MobileNavButtonProps> = ({
  icon,
  isActive,
  onClick,
  theme,
  label,
}) => {
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'flex flex-col transition-all duration-300 items-center justify-center relative p-3 min-w-0 flex-1',
        themeUtils.getButtonRoundednessClass(),
        isActive
          ? cn(themeUtils.getButtonClass(), themeUtils.getPrimaryColorClass('border'), 'border-t-2')
          : 'border-transparent'
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}>
      <div className="flex flex-col justify-center items-center gap-1">
        <div
          className={cn(
            'transition-colors duration-300',
            isActive ? themeUtils.getButtonClass() : isLight ? 'text-gray-600' : 'text-gray-400'
          )}>
          {icon}
        </div>
        <span
          className={cn(
            'text-[10px] font-medium transition-all duration-300 truncate max-w-[60px]',
            isActive ? themeUtils.getButtonClass() : isLight ? 'text-gray-600' : 'text-gray-400'
          )}>
          {label}
        </span>
      </div>
    </motion.button>
  );
};

const MobileCartButton: React.FC<MobileCartButtonProps> = ({ onClick, theme, label }) => {
  const { cart } = useCart();
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'flex flex-col transition-all duration-300 items-center justify-center relative p-3 min-w-0 flex-1',
        themeUtils.getButtonRoundednessClass(),
        'border-transparent'
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}>
      <div className="flex flex-col justify-center items-center gap-1">
        <div className="relative">
          <ShoppingCart size={16} className={cn('transition-colors duration-300')} />
          <AnimatePresence>
            {itemCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={cn(
                  'absolute -top-4 -right-5 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-aktivGroteskBlack',
                  themeUtils.getButtonClass()
                )}>
                {itemCount > 99 ? '99+' : itemCount}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span
          className={cn(
            'text-[10px] font-medium transition-all duration-300 truncate max-w-[60px]',
            isLight ? 'text-gray-600' : 'text-gray-400'
          )}>
          {label}
        </span>
      </div>
    </motion.button>
  );
};

const MobileAccountButton: React.FC<MobileAccountButtonProps> = ({
  isAuthenticated,
  onClick,
  theme,
  label,
}) => {
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'flex flex-col transition-all duration-300 items-center justify-center relative p-3 min-w-0 flex-1',
        themeUtils.getButtonRoundednessClass(),
        'border-transparent'
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}>
      <div className="flex flex-col justify-center items-center gap-1">
        <div
          className={cn(
            'transition-colors duration-300',
            isLight ? 'text-gray-600' : 'text-gray-400'
          )}>
          {isAuthenticated ? <CircleUserRound size={16} /> : <Power size={16} />}
        </div>
        <span
          className={cn(
            'text-[10px] font-medium transition-all duration-300 truncate max-w-[60px]',
            isLight ? 'text-gray-600' : 'text-gray-400'
          )}>
          {label}
        </span>
      </div>
    </motion.button>
  );
};
