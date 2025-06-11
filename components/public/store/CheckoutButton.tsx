/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useBuyerAuth } from '@/hooks/useBuyerAuth';
import { useThemeUtils } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';
import { ThemeType } from '@/types';
import { CreditCard, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutButtonProps {
  theme: ThemeType | null;
  onSuccess: (orderData?: any) => void;
  onError?: (error: string) => void;
  onNavigate?: (page: string) => void;
}

interface OrderResponse {
  success: boolean;
  order?: {
    orderId: string;
    status: string;
    total: number;
    storeName?: string;
    items: Array<{
      productTitle: string;
      quantity: number;
      unitPrice: number;
    }>;
    createdAt: string;
  };
  error?: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ theme, onSuccess, onError }) => {
  const { cart, total, clearCart } = useCart();
  const { buyer, isAuthenticated } = useBuyerAuth();
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);

  const handleCheckout = async () => {
    console.log('🚀 Starting checkout process...');

    if (!isAuthenticated || !buyer) {
      console.log('❌ Authentication failed:', { isAuthenticated, buyer: !!buyer });
      onError?.('Please login to continue');
      return;
    }

    if (cart.length === 0) {
      console.log('❌ Cart is empty');
      onError?.('Cart is empty');
      return;
    }

    console.log('📦 Cart items:', cart);
    console.log('💰 Total amount:', total);

    setIsProcessing(true);
    setOrderStatus('idle');

    try {
      // Prepare order items
      const orderItems = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      console.log('📋 Prepared order items:', orderItems);

      // Create order
      const response = await fetch('/api/v3/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerId: buyer.id,
          items: orderItems,
        }),
      });

      console.log('🌐 API Response status:', response.status);
      const result: OrderResponse = await response.json();
      console.log('📄 API Response data:', result);

      if (!response.ok) {
        console.log('❌ API Error:', result.error);
        throw new Error(result.error || 'Failed to create order');
      }

      if (result.success && result.order) {
        console.log('✅ Order created successfully:', result.order);
        console.log('🎯 Setting order result and status to success...');

        setOrderResult(result);
        setOrderStatus('success');

        console.log('🧹 Clearing cart...');
        clearCart();

        console.log('🎉 Calling onSuccess callback with order data...');
        onSuccess({
          orderId: result.order.orderId,
          items: result.order.items || [],
          total: result.order.total,
          storeName: result.order.storeName || 'ไม่ระบุชื่อร้าน',
          createdAt: result.order.createdAt,
        });
      } else {
        console.log('❌ Order creation failed:', result);
        throw new Error(result.error || 'Order creation failed');
      }
    } catch (error) {
      console.error('💥 Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
      setOrderResult({ success: false, error: errorMessage });
      setOrderStatus('error');
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
      console.log('🏁 Checkout process completed');
    }
  };

  const resetStatus = () => {
    setOrderStatus('idle');
    setOrderResult(null);
  };

  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          'w-full p-4 rounded-xl text-center border',
          isLight
            ? 'bg-light-200 border-light-300 text-dark-600'
            : 'bg-dark-700 border-dark-600 text-light-400'
        )}>
        <p className="text-sm">Please login to checkout</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {orderStatus === 'error' && orderResult?.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn('p-4 rounded-xl border', 'bg-red-50 border-red-200 text-red-800')}>
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={20} className="text-red-600" />
              <h3 className="font-semibold">Order Failed</h3>
            </div>
            <p className="text-sm">{orderResult.error}</p>
            <button
              onClick={resetStatus}
              className="mt-3 text-xs text-red-600 hover:text-red-800 underline">
              Try Again
            </button>
          </motion.div>
        )}

        {orderStatus === 'idle' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={handleCheckout}
            disabled={isProcessing || cart.length === 0}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
              themeUtils.getButtonClass(),
              themeUtils.getPrimaryColorClass('bg'),
              !isProcessing && 'hover:scale-[1.02]'
            )}>
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard size={20} />
                <span>ดำเนินการชำระเงิน</span>
                <div className="flex items-center gap-1 ml-1">
                  <span className="font-bold">{total.toLocaleString()}</span>
                  <span className="text-xs">เหรียญ</span>
                </div>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Order Summary */}
      {cart.length > 0 && orderStatus === 'idle' && (
        <div
          className={cn(
            'text-xs space-y-1 p-3 rounded-lg',
            isLight ? 'bg-light-200 text-dark-600' : 'bg-dark-700 text-light-400'
          )}>
          <div className="flex justify-between">
            <span>Items ({cart.length})</span>
            <span>{total.toLocaleString()} เหรียญ</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{total.toLocaleString()} เหรียญ</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutButton;
