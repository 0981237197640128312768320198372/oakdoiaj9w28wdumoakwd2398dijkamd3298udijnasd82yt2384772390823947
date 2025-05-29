/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreNavbar } from './StoreNavbar';
import PublicStoreProfile from './PublicStoreProfile';
import StoreProducts from './StoreProducts';
import HomeStorePage from './HomeStorePage';
import StoreFooter from './StoreFooter';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import BuyerDashboard from '@/components/public/buyer/BuyerDashboard';
import AuthBuyerPage from '@/components/public/buyer/AuthBuyerPage';

interface PublicStoreLayoutProps {
  theme: ThemeType | null;
  seller: any;
  products: any[];
  categories: any[];
  children: React.ReactNode;
}

const PublicStoreLayout: React.FC<PublicStoreLayoutProps> = ({
  theme,
  seller,
  products,
  categories,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [activePage, setActivePage] = useState('home');

  const themeUtils = useThemeUtils(theme);
  const { isAuthenticated, buyer, logout } = useBuyerAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case 'profile':
        return <PublicStoreProfile seller={seller} theme={theme} />;
      case 'products':
        return <StoreProducts store={seller?.username} theme={theme} />;
      case 'authbuyer':
        return <AuthBuyerPage onNavigate={setActivePage} seller={seller} theme={theme} />;
      case 'buyerdashboard':
        return <BuyerDashboard theme={theme} onNavigate={setActivePage} />;
      case 'home':
      default:
        return <HomeStorePage products={products} categories={categories} theme={theme} />;
    }
  };

  const getLayoutStyles = () => {
    const isLight = themeUtils.baseTheme === 'light';
    return {
      background: isLight ? 'bg-light-100' : 'bg-dark-800',
      text: isLight ? 'text-dark-800' : 'text-light-100',
    };
  };

  const layoutStyles = getLayoutStyles();

  return (
    <div className={cn('min-h-screen w-full', layoutStyles.background, layoutStyles.text)}>
      <StoreNavbar
        theme={theme}
        seller={seller}
        activePage={activePage}
        isAuthenticated={isAuthenticated}
        onNavigate={setActivePage}
      />

      <motion.div
        className="flex flex-col items-center min-h-screen justify-start w-full py-20 lg:pt-32 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}>
        <AnimatePresence mode="wait">
          <motion.div
            className="w-full px-5 lg:px-0 max-w-screen-lg"
            key={activePage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <StoreFooter seller={seller} theme={theme} />
    </div>
  );
};

export default PublicStoreLayout;
