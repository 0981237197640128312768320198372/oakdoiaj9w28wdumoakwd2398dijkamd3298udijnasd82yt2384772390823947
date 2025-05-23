/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import type { ThemeType } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreNavbar } from './StoreNavbar';
import Image from 'next/image';
import PublicStoreProfile from './PublicStoreProfile';
import StoreProducts from './StoreProducts';
import HomeStorePage from './HomeStorePage';

interface PublicStoreLayoutProps {
  theme: ThemeType;
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
    // Add a small delay for animation purposes
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const getButtonStyles = () => {
    return {
      backgroundColor: theme?.buttonBgColor || '#B9FE13',
      color: theme?.buttonTextColor || '#0F0F0F',
      borderRadius:
        theme?.roundedness === 'rounded-full'
          ? '9999px'
          : theme?.roundedness === 'square'
          ? '0px'
          : '0.375rem',
      border:
        theme?.buttonBorder === 'border-none'
          ? 'none'
          : theme?.buttonBorder === 'border'
          ? '1px solid'
          : '2px solid',
      borderColor: theme?.primaryColor,
    };
  };

  // Render the appropriate content based on the active page
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
      {/* Background image or pattern if provided */}
      {theme?.backgroundImage && (
        <div
          className="fixed inset-0 z-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url(${theme.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      <StoreNavbar seller={seller} activePage={activePage} onNavigate={setActivePage} />

      <motion.div
        className="flex flex-col items-center justify-start w-full pb-20 pt-28 lg:pt-32 relative z-10"
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

      <footer
        className="w-full py-6 mt-20 border-t"
        style={{ borderColor: `${theme?.primaryColor}40` }}>
        <div className="max-w-screen-lg mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm opacity-70">
            © {new Date().getFullYear()} {seller?.store?.name} | Powered by Dokmai Store
          </div>

          <div className="flex gap-4">
            {seller?.contact?.facebook && (
              <a
                href={`https://${seller.contact.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                style={{ color: theme?.primaryColor }}>
                Facebook
              </a>
            )}
            {seller?.contact?.line && (
              <a
                href={`https://line.me/ti/p/${seller.contact.line.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                style={{ color: theme?.primaryColor }}>
                Line
              </a>
            )}
            {seller?.contact?.instagram && (
              <a
                href={`https://instagram.com/${seller.contact.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                style={{ color: theme?.primaryColor }}>
                Instagram
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicStoreLayout;
