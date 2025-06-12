'use client';

import { useState } from 'react';
import { useThemeUtils } from '@/lib/theme-utils';
import { cn, dokmaiCoinSymbol } from '@/lib/utils';
import { ThemeType } from '@/types';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  Truck,
} from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  digitalAssets?: Array<{ key: string; value: string }>;
  productImages: string[];
}

interface Order {
  orderId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryStatus: 'pending' | 'processing' | 'delivered' | 'failed';
  buyer: {
    id: string;
    username: string;
    email: string;
  };
  seller: {
    id: string;
    username: string;
    storeName?: string;
    logoUrl?: string;
  };
  items: OrderItem[];
  totals: {
    subtotal: number;
    total: number;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
    completedAt?: string;
    cancelledAt?: string;
  };
  metadata?: Record<string, unknown>;
}

interface OrderDetailProps {
  order: Order;
  theme: ThemeType | null;
  onBack?: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, theme, onBack }) => {
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';
  const dokmaiCoin = dokmaiCoinSymbol(isLight);
  const [copiedAssets, setCopiedAssets] = useState(false);

  const parseAssetValue = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  const copyAllAssets = async () => {
    const allAssets: string[] = [];

    order.items.forEach((item) => {
      if (item.digitalAssets && item.digitalAssets.length > 0) {
        item.digitalAssets.forEach((asset) => {
          const parsedValue = parseAssetValue(asset.value);

          if (parsedValue) {
            // Handle JSON objects
            Object.entries(parsedValue).forEach(([key, value]) => {
              const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
              allAssets.push(`${capitalizedKey}: ${String(value)}`);
            });
          } else {
            // Handle plain text values
            const capitalizedKey = asset.key.charAt(0).toUpperCase() + asset.key.slice(1);
            allAssets.push(`${capitalizedKey}: ${asset.value}`);
          }
        });
      }
    });

    const assetsText = allAssets.join('\n');

    try {
      await navigator.clipboard.writeText(assetsText);
      setCopiedAssets(true);
      setTimeout(() => setCopiedAssets(false), 3000);
    } catch (err) {
      console.error('Failed to copy assets: ', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={12} className="text-yellow-500" />;
      case 'confirmed':
        return <Package size={12} className="text-blue-500" />;
      case 'completed':
        return <CheckCircle size={12} className="text-green-500" />;
      case 'cancelled':
        return <XCircle size={12} className="text-red-500" />;
      default:
        return <AlertTriangle size={12} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/5 text-yellow-500 border-yellow-500';
      case 'confirmed':
        return 'bg-blue-500/5 text-blue-500 border-blue-500';
      case 'completed':
        return 'bg-green-500/5 text-green-500 border-green-500';
      case 'cancelled':
        return 'bg-red-500/5 text-red-500 border-red-500';
      case 'paid':
        return 'bg-green-500/5 text-green-500 border-green-500';
      case 'failed':
        return 'bg-red-500/5 text-red-500 border-red-500';
      case 'refunded':
        return 'bg-orange-500/5 text-orange-500 border-orange-500';
      case 'processing':
        return 'bg-blue-500/5 text-blue-500 border-blue-500';
      case 'delivered':
        return 'bg-green-500/5 text-green-500 border-green-500';
      default:
        return 'bg-gray-500/5 text-gray-500 border-gray-500';
    }
  };

  const getCurrentStatus = () => {
    // Priority order: cancelled > failed > pending payment > delivery status > order status
    if (order.status === 'cancelled') {
      return {
        type: 'ORDER',
        status: order.status,
        icon: <Package size={10} />,
      };
    }

    if (order.paymentStatus === 'failed') {
      return {
        type: 'PAYMENT',
        status: order.paymentStatus,
        icon: <CreditCard size={10} />,
      };
    }

    if (order.paymentStatus === 'pending') {
      return {
        type: 'PAYMENT',
        status: order.paymentStatus,
        icon: <CreditCard size={10} />,
      };
    }

    if (order.paymentStatus === 'paid' && order.deliveryStatus !== 'delivered') {
      return {
        type: 'DELIVERY',
        status: order.deliveryStatus,
        icon: <Truck size={10} />,
      };
    }

    // Default to order status
    return {
      type: 'ORDER',
      status: order.status,
      icon: <Package size={10} />,
    };
  };

  const currentStatus = getCurrentStatus();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasDigitalAssets = order.items.some(
    (item) => item.digitalAssets && item.digitalAssets.length > 0
  );

  return (
    <>
      {/* Grid Container */}
      <div
        className={cn(
          'w-full p-5',
          themeUtils.getCardClass(),
          themeUtils.getComponentRoundednessClass()
        )}>
        <div
          className={cn(
            'grid gap-5',
            hasDigitalAssets && order.status === 'completed'
              ? 'grid-cols-1 lg:grid-cols-2'
              : 'grid-cols-1'
          )}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}>
            <div
              className={cn(
                'p-5 space-y-5',
                isLight ? themeUtils.getCardClass() : 'bg-dark-600 border border-dark-400',
                themeUtils.getComponentRoundednessClass()
              )}>
              <div className="wfull flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {order.seller.logoUrl && (
                    <Image
                      src={order.seller.logoUrl}
                      alt={order.seller.storeName || order.seller.username}
                      width={32}
                      height={32}
                      className={cn(
                        themeUtils.getCardClass(),
                        themeUtils.getComponentRoundednessClass()
                      )}
                    />
                  )}
                  <h3
                    className={cn(
                      'font-semibold text-base',
                      isLight ? 'text-dark-800' : 'text-light-200'
                    )}>
                    {order.seller.storeName || order.seller.username}
                  </h3>
                </div>
                <span className={cn('text-sm', isLight ? 'text-dark-600' : 'text-light-500')}>
                  {formatDate(order.timestamps.createdAt)}
                </span>
              </div>

              {/* Receipt Title and Amount */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 ">
                  <Image
                    src={dokmaiCoin}
                    alt="Dokmai Coin"
                    width={24}
                    height={24}
                    className="h-6 w-auto"
                  />
                  <span
                    className={cn(
                      'text-3xl font-bold',
                      isLight ? 'text-dark-800' : 'text-light-200'
                    )}>
                    {order.totals.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex items-center justify-center gap-1 px-2 py-1 text-xs border-[1px]',
                      getStatusColor(currentStatus.status),
                      themeUtils.getButtonRoundednessClass()
                    )}>
                    {getStatusIcon(currentStatus.status)}
                    <span className="capitalize font-bold">{currentStatus.status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isLight ? 'text-dark-600' : 'text-light-500'
                      )}>
                      Order ID
                    </p>
                    <p
                      className={cn(
                        'text-sm font-mono',
                        isLight ? 'text-dark-800' : 'text-light-200'
                      )}>
                      {order.orderId}
                    </p>
                  </div>
                  <div>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isLight ? 'text-dark-600' : 'text-light-500'
                      )}>
                      Payment method
                    </p>
                    <div className="flex items-center gap-2">
                      <Image
                        src={dokmaiCoin}
                        alt="Dokmai Coin"
                        width={16}
                        height={16}
                        className="h-4 w-auto"
                      />
                      Dokmai Coin
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-5">
                  <div
                    className={cn(
                      'space-y-3',
                      isLight ? themeUtils.getCardClass() : 'bg-dark-500 border border-dark-400',
                      themeUtils.getComponentRoundednessClass()
                    )}>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center w-full p-5 justify-between">
                        <div className="flex w-full items-center gap-3">
                          {item.productImages && item.productImages[0] && (
                            <Image
                              src={item.productImages[0]}
                              alt={item.productTitle}
                              width={50}
                              height={50}
                              className={cn(
                                'w-10 h-auto lg:w-14',
                                themeUtils.getCardClass(),
                                themeUtils.getComponentRoundednessClass()
                              )}
                            />
                          )}
                          <div className="flex w-full justify-between gap-1">
                            <p
                              className={cn(
                                'text-sm font-medium',
                                isLight ? 'text-dark-800' : 'text-light-200'
                              )}>
                              {item.productTitle}
                            </p>

                            <span
                              className={cn(
                                'text-sm font-bold p-1',
                                isLight ? 'text-dark-800' : 'text-light-200'
                              )}>
                              {item.quantity}x
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Digital Assets Card */}
          {order.status === 'completed' && hasDigitalAssets && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1 }}
              className={cn(
                'rounded-xl border shadow-sm',
                isLight ? themeUtils.getCardClass() : 'bg-dark-600 border border-dark-400'
              )}>
              <div className="p-5">
                <div className="space-y-5">
                  {order.items.map((item, itemIndex) => {
                    if (!item.digitalAssets || item.digitalAssets.length === 0) {
                      return null;
                    }
                    return (
                      <div key={itemIndex} className="space-y-2">
                        <div className="grid  gap-5">
                          {item.digitalAssets.map((asset, assetIndex) => {
                            const parsedValue = parseAssetValue(asset.value);
                            return (
                              <motion.div
                                key={assetIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * assetIndex }}
                                className={cn(
                                  'p-5 border',
                                  themeUtils.getComponentRoundednessClass(),
                                  isLight
                                    ? themeUtils.getCardClass()
                                    : 'bg-dark-500 border border-dark-400'
                                )}>
                                {parsedValue ? (
                                  <div className="space-y-2">
                                    {Object.entries(parsedValue).map(([key, value], index) => (
                                      <div key={index} className={cn('flex flex-col')}>
                                        <label
                                          className={cn(
                                            'text-xs font-thin',
                                            isLight ? 'text-dark-600' : 'text-light-400'
                                          )}>
                                          {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </label>
                                        <span
                                          className={cn(
                                            'text-xs text-end font-bold w-full border-b-[1px]',
                                            isLight
                                              ? 'text-dark-800 border-light-400'
                                              : 'text-light-200 border-dark-400'
                                          )}>
                                          {String(value)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div
                                    className={cn(
                                      'flex items-center justify-between p-2 rounded border text-xs',
                                      isLight
                                        ? 'bg-white border-gray-200'
                                        : 'bg-dark-800 border-dark-500'
                                    )}>
                                    <span
                                      className={cn(
                                        'font-medium',
                                        isLight ? 'text-dark-600' : 'text-light-400'
                                      )}>
                                      {asset.key.charAt(0).toUpperCase() + asset.key.slice(1)}:
                                    </span>
                                    <span
                                      className={cn(
                                        'font-mono break-all',
                                        isLight ? 'text-dark-800' : 'text-light-200'
                                      )}>
                                      {asset.value}
                                    </span>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={copyAllAssets}
                  className={cn(
                    'flex items-center justify-center mt-5 w-full gap-1 p-1.5 text-sm font-black transition-colors border duration-200',
                    themeUtils.getButtonClass()
                  )}>
                  {copiedAssets ? 'Copied!' : 'Copy All'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
        <div className="w-full mt-5">
          {onBack && (
            <button
              onClick={onBack}
              className={cn(
                'p-1.5 text-sm font-black transition-colors w-full bg-red-500/20 hover:bg-red-500/50 border-red-500/70 text-red-500',
                themeUtils.getButtonBorderClass()
              )}>
              Close
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
