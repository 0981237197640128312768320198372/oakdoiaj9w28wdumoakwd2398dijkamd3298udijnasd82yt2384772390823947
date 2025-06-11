/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCart } from '@/context/CartContext';
import { useThemeUtils } from '@/lib/theme-utils';
import { cn, dokmaiCoinSymbol, dokmaiImagePlaceholder } from '@/lib/utils';
import { ThemeType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import CheckoutButton from './CheckoutButton';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType | null;
  onNavigate?: (page: string) => void;
  onOrderSuccess?: (orderData: any) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  theme,
  onNavigate,
  onOrderSuccess,
}) => {
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';
  const dokmaiCoin = dokmaiCoinSymbol(isLight);
  const imagePlaceholder = dokmaiImagePlaceholder(isLight);
  const handleCheckoutSuccess = (orderData: any) => {
    console.log('🎉 CartDrawer received order success:', orderData);
    // Pass order data up to parent instead of just closing drawer
    onOrderSuccess?.(orderData);
  };

  const handleCheckoutError = (error: string) => {
    console.error('Checkout error:', error);
    // You can add toast notification here if needed
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'fixed inset-0 backdrop-blur z-50',
              isLight ? 'bg-light-200/50' : 'bg-dark-800/50'
            )}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col shadow-md shadow-black/30',
              isLight ? 'bg-light-100 text-dark-800' : 'bg-dark-800 text-light-100',
              'shadow-xl'
            )}>
            {/* Header */}
            <div
              className={cn(
                'flex items-center justify-between p-4 border-b',
                isLight ? 'border-light-300' : 'border-dark-600'
              )}>
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className={themeUtils.getPrimaryColorClass('text')} />
                <h2 className="text-lg font-bold">ตะกร้าสินค้า</h2>
              </div>
              <button
                onClick={onClose}
                className={cn(
                  'p-2 rounded-full transition-colors',
                  isLight ? 'hover:bg-light-300' : 'hover:bg-dark-600'
                )}>
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div
                    className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center',
                      isLight ? 'bg-light-300' : 'bg-dark-600'
                    )}>
                    <ShoppingCart size={24} className={themeUtils.getPrimaryColorClass('text')} />
                  </div>
                  <p className="text-lg font-medium">ตะกร้าของคุณว่างเปล่า</p>
                  <p className={cn('text-sm', isLight ? 'text-dark-500' : 'text-light-500')}>
                    เพิ่มสินค้าลงในตะกร้าเพื่อดำเนินการต่อ
                  </p>
                  <button
                    onClick={onClose}
                    className={cn(
                      'mt-4 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                      themeUtils.getButtonClass(),
                      themeUtils.getPrimaryColorClass('bg')
                    )}>
                    เลือกซื้อสินค้า
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl',
                        isLight ? 'bg-light-200' : 'bg-dark-700'
                      )}>
                      {/* Product Image */}
                      <div
                        className={cn(
                          'relative w-16 h-16 overflow-hidden rounded-lg flex-shrink-0 flex items-center justify-center',
                          isLight ? 'bg-light-200' : 'bg-dark-600'
                        )}>
                        <Image
                          src={item.imageUrl || imagePlaceholder}
                          alt={item.appName}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (typeof imagePlaceholder === 'string') {
                              target.src = imagePlaceholder;
                            } else {
                              target.src = imagePlaceholder.src;
                            }
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.appName}</h3>
                        <p className={cn('text-sm', isLight ? 'text-dark-500' : 'text-light-500')}>
                          {item.duration}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <Image
                              src={dokmaiCoin}
                              alt="Dokmai Coin"
                              width={16}
                              height={16}
                              className="h-4 w-auto"
                            />
                            <p className="font-bold">{item.price.toLocaleString()}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className={cn(
                                'p-1 rounded-full transition-colors',
                                isLight ? 'hover:bg-light-300' : 'hover:bg-dark-600',
                                item.quantity <= 1 && 'opacity-50 cursor-not-allowed'
                              )}>
                              <Minus size={14} />
                            </button>

                            <span className="w-6 text-center">{item.quantity}</span>

                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className={cn(
                                'p-1 rounded-full transition-colors',
                                isLight ? 'hover:bg-light-300' : 'hover:bg-dark-600'
                              )}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className={cn(
                          'p-2 rounded-full transition-colors',
                          isLight
                            ? 'hover:bg-light-300 text-dark-500'
                            : 'hover:bg-dark-600 text-light-500'
                        )}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className={cn(
                        'w-full text-center py-2 text-sm transition-colors',
                        isLight
                          ? `${themeUtils.getPrimaryColorClass(
                              'text'
                            )} hover:${themeUtils.getPrimaryColorClass('bg')}/10`
                          : `${themeUtils.getPrimaryColorClass(
                              'text'
                            )} hover:${themeUtils.getPrimaryColorClass('bg')}/20`,
                        'rounded-xl'
                      )}>
                      ล้างตะกร้า
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className={cn('p-4 border-t', isLight ? 'border-light-300' : 'border-dark-600')}>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className={isLight ? 'text-dark-500' : 'text-light-500'}>ยอดรวม</span>
                    <div className="flex items-center gap-1">
                      <Image
                        src={dokmaiCoin}
                        alt="Dokmai Coin"
                        width={20}
                        height={20}
                        className="h-5 w-auto"
                      />
                      <span className="font-medium">{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <CheckoutButton
                  theme={theme}
                  onSuccess={handleCheckoutSuccess}
                  onError={handleCheckoutError}
                  onNavigate={onNavigate}
                />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
