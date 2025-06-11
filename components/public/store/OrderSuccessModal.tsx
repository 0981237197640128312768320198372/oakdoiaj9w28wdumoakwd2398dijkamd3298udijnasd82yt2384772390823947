'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Package, Calendar, Store, Hash, Eye, X } from 'lucide-react';
import { useThemeUtils } from '@/lib/theme-utils';
import { cn, dokmaiCoinSymbol } from '@/lib/utils';
import { ThemeType } from '@/types';
import Image from 'next/image';

interface OrderItem {
  productTitle: string;
  quantity: number;
  unitPrice: number;
}

interface OrderSuccessData {
  orderId: string;
  items: OrderItem[];
  total: number;
  storeName?: string;
  createdAt: string;
}

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: OrderSuccessData;
  theme: ThemeType | null;
  onViewOrderDetails: () => void;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderData,
  theme,
  onViewOrderDetails,
}) => {
  // Always call hooks first - React hooks must be called unconditionally
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';
  const dokmaiCoin = dokmaiCoinSymbol(isLight);

  // Debug logging
  console.log('🎭 OrderSuccessModal render:', {
    isOpen,
    hasOrderData: !!orderData,
    orderData,
    theme: theme?.baseTheme || 'no theme',
  });

  // Early return after hooks are called
  if (!isOpen) {
    console.log('🚫 Modal not open, returning null');
    return null;
  }

  // Validate required data
  if (!orderData) {
    console.error('OrderSuccessModal: orderData is required');
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'ไม่ระบุวันที่';
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('OrderSuccessModal: Date formatting error:', error);
      return 'ไม่ระบุวันที่';
    }
  };

  const getProductDisplayName = () => {
    try {
      if (!orderData?.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return 'สินค้าที่สั่งซื้อ';
      }
      if (orderData.items.length === 1) {
        return orderData.items[0]?.productTitle || 'สินค้าที่สั่งซื้อ';
      }
      const firstProduct = orderData.items[0]?.productTitle || 'สินค้าที่สั่งซื้อ';
      return `${firstProduct} และอีก ${orderData.items.length - 1} รายการ`;
    } catch (error) {
      console.error('OrderSuccessModal: Product display name error:', error);
      return 'สินค้าที่สั่งซื้อ';
    }
  };

  const getTotalQuantity = () => {
    try {
      if (!orderData?.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return 0;
      }
      return orderData.items.reduce((sum, item) => {
        const quantity = typeof item?.quantity === 'number' ? item.quantity : 0;
        return sum + quantity;
      }, 0);
    } catch (error) {
      console.error('OrderSuccessModal: Total quantity calculation error:', error);
      return 0;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 h-screen w-screen z-[99999] flex flex-col justify-center items-center backdrop-blur-md bg-dark-800/30 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'max-w-md w-full rounded-2xl border shadow-2xl',
              isLight ? 'bg-light-100 border-light-300' : 'bg-dark-700 border-dark-600'
            )}>
            {/* Header */}
            <div className="p-6 text-center border-b border-green-200">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3, ease: 'easeOut' }}
                className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className={cn(
                  'text-xl font-bold mb-2',
                  isLight ? 'text-dark-800' : 'text-light-200'
                )}>
                สั่งซื้อสำเร็จ!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className={cn('text-sm', isLight ? 'text-dark-600' : 'text-light-500')}>
                คำสั่งซื้อของคุณได้รับการยืนยันแล้ว
              </motion.p>
            </div>

            {/* Order Details */}
            <div className="p-6 space-y-4">
              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border',
                  isLight ? 'bg-light-200 border-light-300' : 'bg-dark-600 border-dark-500'
                )}>
                <Package size={20} className={themeUtils.getPrimaryColorClass('text')} />
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      'font-semibold text-sm mb-1',
                      isLight ? 'text-dark-800' : 'text-light-200'
                    )}>
                    {getProductDisplayName()}
                  </h3>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={cn(isLight ? 'text-dark-600' : 'text-light-500')}>
                      จำนวน: {getTotalQuantity()} ชิ้น
                    </span>
                    <div className="flex items-center gap-1">
                      <Image
                        src={dokmaiCoin}
                        alt="Dokmai Coin"
                        width={14}
                        height={14}
                        className="h-3.5 w-auto"
                      />
                      <span
                        className={cn('font-bold', isLight ? 'text-dark-800' : 'text-light-200')}>
                        {orderData.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Order Info Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="grid grid-cols-2 gap-4">
                {/* Store Name */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Store size={14} className={cn(isLight ? 'text-dark-500' : 'text-light-600')} />
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isLight ? 'text-dark-600' : 'text-light-500'
                      )}>
                      ร้านค้า
                    </span>
                  </div>
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      isLight ? 'text-dark-800' : 'text-light-200'
                    )}>
                    {orderData.storeName || 'ไม่ระบุ'}
                  </p>
                </div>

                {/* Order Date */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar
                      size={14}
                      className={cn(isLight ? 'text-dark-500' : 'text-light-600')}
                    />
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isLight ? 'text-dark-600' : 'text-light-500'
                      )}>
                      วันที่สั่ง
                    </span>
                  </div>
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      isLight ? 'text-dark-800' : 'text-light-200'
                    )}>
                    {formatDate(orderData.createdAt)}
                  </p>
                </div>
              </motion.div>

              {/* Order ID */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.3 }}
                className="space-y-1">
                <div className="flex items-center gap-1">
                  <Hash size={14} className={cn(isLight ? 'text-dark-500' : 'text-light-600')} />
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isLight ? 'text-dark-600' : 'text-light-500'
                    )}>
                    หมายเลขคำสั่งซื้อ
                  </span>
                </div>
                <p
                  className={cn(
                    'font-mono text-sm font-semibold',
                    isLight ? 'text-dark-800' : 'text-light-200'
                  )}>
                  {orderData.orderId}
                </p>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.3 }}
                onClick={onViewOrderDetails}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:scale-[1.02]',
                  themeUtils.getButtonClass(),
                  themeUtils.getPrimaryColorClass('bg')
                )}>
                <Eye size={18} />
                <span>ดูรายละเอียดคำสั่งซื้อ</span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.3 }}
                onClick={onClose}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all border',
                  isLight
                    ? 'bg-light-200 border-light-300 text-dark-700 hover:bg-light-300'
                    : 'bg-dark-600 border-dark-500 text-light-300 hover:bg-dark-500'
                )}>
                <X size={18} />
                <span>ปิด</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderSuccessModal;
