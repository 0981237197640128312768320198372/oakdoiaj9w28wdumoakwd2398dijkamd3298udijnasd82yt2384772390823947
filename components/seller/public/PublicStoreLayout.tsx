/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreNavbar } from './StoreNavbar';
import Image from 'next/image';
import PublicStoreProfile from './PublicStoreProfile';
import StoreProducts from './StoreProducts';
import HomeStorePage from './HomeStorePage';
import StoreFooter from './StoreFooter';

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
        return <HomeStorePage products={products} categories={categories} />;
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: theme?.secondaryColor || '#0F0F0F',
        color: theme?.textColor || '#ECECEC',
        fontFamily: theme?.fontFamily || 'AktivGrotesk-Regular',
      }}>
      <StoreNavbar seller={seller} activePage={activePage} onNavigate={setActivePage} />

      <motion.div
        className="flex flex-col items-center min-h-screen justify-start w-full pb-20 pt-28 lg:pt-32 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}>
        <div className="w-full max-w-screen-lg px-5 lg:px-0 relative">
          {theme?.adsImageUrl && theme.adsImageUrl !== 'null' && (
            <div
              className="w-full mb-8 overflow-hidden rounded-lg shadow-xl"
              style={{
                borderRadius:
                  theme?.roundedness === 'rounded-full'
                    ? '1rem'
                    : theme?.roundedness === 'square'
                    ? '0'
                    : '0.5rem',
                boxShadow:
                  theme?.shadow !== 'shadow-none'
                    ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    : 'none',
              }}>
              <Image
                src={theme.adsImageUrl || '/placeholder.svg'}
                alt={`${seller?.store?.name} promotion`}
                width={1200}
                height={300}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

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
        </div>
      </motion.div>

      <StoreFooter seller={seller} theme={theme} />
    </div>
  );
};

export default PublicStoreLayout;
