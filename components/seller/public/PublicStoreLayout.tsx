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

interface PublicStoreLayoutProps {
  theme: any;
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case 'profile':
        return <PublicStoreProfile seller={seller} products={products} categories={categories} />;
      case 'products':
        return <StoreProducts store={seller?.username} />;
      case 'home':
      default:
        return <HomeStorePage products={products} categories={categories} theme={theme} />;
    }
  };
  console.log('AOWKOAKWOAKOWAKOAKOWK');
  const baseTheme = theme?.baseTheme;
  const getBaseTheme = () => {
    return baseTheme === 'light' ? 'bg-light-100 text-dark-800' : 'bg-dark-800 text-light-100';
  };
  return (
    <div className={cn('min-h-screen w-full', getBaseTheme())}>
      <StoreNavbar
        theme={theme}
        seller={seller}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <motion.div
        className="flex flex-col items-center min-h-screen justify-start w-full py-20 lg:pt-32 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}>
        <AnimatePresence mode="wait">
          <motion.div
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
