/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreNavbar } from './StoreNavbar';
import CartDrawer from './CartDrawer';
import OrderSuccessModal from './OrderSuccessModal';
import { CartProvider } from '@/context/CartContext';
import PublicStoreProfile from './PublicStoreProfile';
import StoreProducts from './StoreProducts';
import HomeStorePage from './HomeStorePage';
import StoreFooter from './StoreFooter';
import { cn, consoleFuck } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import BuyerDashboard from '@/components/public/buyer/dashboard/BuyerDashboard';
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);

  const themeUtils = useThemeUtils(theme);
  const { isAuthenticated, buyer, logout } = useBuyerAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle order success from checkout
  const handleOrderSuccess = (orderData: any) => {
    console.log('🎉 Order success received in PublicStoreLayout:', orderData);
    setOrderSuccessData(orderData);
    setShowOrderModal(true);
    setIsCartOpen(false); // Close cart drawer
  };

  // Handle closing order modal
  const handleCloseOrderModal = () => {
    console.log('🚪 Closing order modal');
    setShowOrderModal(false);
    setOrderSuccessData(null);
  };

  // Handle view order details
  const handleViewOrderDetails = () => {
    console.log('👁️ View order details requested');
    handleCloseOrderModal();
    setActivePage('buyerdashboard');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'profile':
        return <PublicStoreProfile seller={seller} theme={theme} />;
      case 'products':
        return <StoreProducts store={seller?.username} theme={theme} />;
      case 'authbuyer':
        return <AuthBuyerPage onNavigate={setActivePage} seller={seller} theme={theme} />;
      case 'buyerdashboard':
        return <BuyerDashboard theme={theme} />;
      case 'home':
      default:
        return (
          <HomeStorePage
            onNavigate={setActivePage}
            products={products}
            categories={categories}
            theme={theme}
          />
        );
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
  console.log(
    `%c${consoleFuck}`,
    'display: inline-block; width: 64px; height: 64px; text-align: center; line-height: 64px; font-size: 32px; color: white; background: #0f0f0f; padding: 10px; font-weight: bold; border-radius: 10px;'
  );
  return (
    <CartProvider>
      <div className={cn('min-h-screen w-full', layoutStyles.background, layoutStyles.text)}>
        <StoreNavbar
          theme={theme}
          seller={seller}
          activePage={activePage}
          isAuthenticated={isAuthenticated}
          onNavigate={setActivePage}
          onCartOpen={() => setIsCartOpen(true)}
        />

        <motion.div
          className="flex flex-col items-center min-h-fit justify-start w-full relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}>
          <AnimatePresence mode="wait">
            <motion.div
              className="w-full px-5 lg:px-0 max-w-screen-lg pt-16 lg:pt-32"
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
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          theme={theme}
          onNavigate={setActivePage}
          onOrderSuccess={handleOrderSuccess}
        />

        {/* Order Success Modal */}
        {showOrderModal && orderSuccessData && (
          <OrderSuccessModal
            isOpen={showOrderModal}
            onClose={handleCloseOrderModal}
            orderData={orderSuccessData}
            theme={theme}
            onViewOrderDetails={handleViewOrderDetails}
          />
        )}
      </div>
    </CartProvider>
  );
};

export default PublicStoreLayout;
