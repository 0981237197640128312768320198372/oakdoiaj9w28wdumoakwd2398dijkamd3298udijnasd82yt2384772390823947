/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useThemeUtils } from '@/lib/theme-utils';
import { cn, dokmaiCoinSymbol } from '@/lib/utils';
import { ThemeType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import { useBuyerAuth } from '@/hooks/useBuyerAuth';
import OrderDetail from './OrderDetail';

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

interface OrderHistoryResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
}

interface OrderHistoryProps {
  theme: ThemeType | null;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ theme }) => {
  const { buyer, isAuthenticated } = useBuyerAuth();
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';
  const dokmaiCoin = dokmaiCoinSymbol(isLight);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    if (isAuthenticated && buyer) {
      fetchOrders();
    }
  }, [isAuthenticated, buyer, currentPage, statusFilter]);

  const fetchOrders = async () => {
    if (!buyer) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        buyerId: buyer.id,
        page: currentPage.toString(),
        limit: '10',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/v3/orders/history?${params}`);
      const data: OrderHistoryResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 rounded-xl border',
          themeUtils.getCardClass()
        )}>
        <ShoppingBag size={48} className={cn(isLight ? 'text-dark-400' : 'text-light-600')} />
        <h3
          className={cn(
            'text-lg font-semibold mt-4',
            isLight ? 'text-dark-800' : 'text-light-200'
          )}>
          Please Login
        </h3>
        <p className={cn('text-sm mt-2', isLight ? 'text-dark-600' : 'text-light-500')}>
          You need to login to view your order history
        </p>
      </div>
    );
  }

  // Show order details if an order is selected
  if (selectedOrder) {
    return (
      <div className="space-y-6">
        <OrderDetail order={selectedOrder} theme={theme} onBack={handleBackToList} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={20} className={themeUtils.getPrimaryColorClass('text')} />
          <h2
            className={cn(
              'text-base sm:text-lg font-bold',
              isLight ? 'text-dark-800' : 'text-light-200'
            )}>
            Order History
          </h2>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
            themeUtils.getButtonClass(),
            loading && 'opacity-50 cursor-not-allowed'
          )}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={cn(
            'px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2',
            isLight
              ? 'bg-light-100 border-light-300 text-dark-800 focus:ring-primary/20'
              : 'bg-dark-600 border-dark-400 text-light-200 focus:ring-primary/20'
          )}>
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn('animate-pulse p-4 rounded-xl border', themeUtils.getCardClass())}>
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-2">
                  <div
                    className={cn('h-4 w-32 rounded', isLight ? 'bg-light-300' : 'bg-dark-600')}
                  />
                  <div
                    className={cn('h-3 w-24 rounded', isLight ? 'bg-light-300' : 'bg-dark-600')}
                  />
                </div>
                <div className={cn('h-6 w-20 rounded', isLight ? 'bg-light-300' : 'bg-dark-600')} />
              </div>
              <div className={cn('h-3 w-full rounded', isLight ? 'bg-light-300' : 'bg-dark-600')} />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-xl border',
            'bg-red-50 border-red-200 text-red-800'
          )}>
          <XCircle size={20} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && (
        <AnimatePresence mode="wait">
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex flex-col items-center justify-center p-12 rounded-xl border',
                themeUtils.getCardClass()
              )}>
              <Package size={48} className={cn(isLight ? 'text-dark-400' : 'text-light-600')} />
              <h3
                className={cn(
                  'text-lg font-semibold mt-4',
                  isLight ? 'text-dark-800' : 'text-light-200'
                )}>
                No Orders Found
              </h3>
              <p className={cn('text-sm mt-2', isLight ? 'text-dark-600' : 'text-light-500')}>
                You haven't placed any orders yet
              </p>
            </motion.div>
          ) : (
            <>
              <div className="space-y-5 ">
                {orders.slice(0, visibleCount).map((order) => (
                  <motion.div
                    key={order.orderId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleViewDetails(order)}
                    className={cn(
                      'p-5 transition-all duration-200 hover:shadow-md cursor-pointer',
                      themeUtils.getCardClass(),
                      themeUtils.getComponentRoundednessClass(),
                      isLight ? 'hover:!bg-gray-50' : 'hover:!bg-dark-600'
                    )}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'font-mono text-xs sm:text-sm',
                              isLight ? 'text-dark-800' : 'text-light-200'
                            )}>
                            #{order.orderId}
                          </span>
                          <div
                            className={cn(
                              'flex items-center gap-1 px-2 py-1 rounded-full text-xs border',
                              getStatusColor(order.status)
                            )}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ">
                        <div className="flex items-center gap-1">
                          <Image
                            src={dokmaiCoin}
                            alt="Dokmai Coin"
                            width={14}
                            height={14}
                            className="h-3.5 w-auto"
                          />
                          <span
                            className={cn(
                              'font-bold text-sm',
                              isLight ? 'text-dark-800' : 'text-light-200'
                            )}>
                            {order.totals.total.toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={cn('text-xs', isLight ? 'text-dark-600' : 'text-light-500')}>
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {order.seller.logoUrl && (
                          <Image
                            src={order.seller.logoUrl}
                            alt={order.seller.storeName || order.seller.username}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        )}
                        <span
                          className={cn(
                            'text-xs sm:text-sm',
                            isLight ? 'text-dark-700' : 'text-light-300'
                          )}>
                          {order.seller.storeName || order.seller.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar size={10} />
                        <span className={cn(isLight ? 'text-dark-600' : 'text-light-500')}>
                          {formatDate(order.timestamps.createdAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {visibleCount < orders.length && (
                <div className="w-full">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className={cn(
                      'mt-5 px-4 py-2 border w-full text-sm transition-colors rounded-md flex items-center justify-center gap-2',
                      themeUtils.getCardClass(),
                      isLight
                        ? 'hover:!bg-light-100/50 hover:!border-white'
                        : 'hover:!bg-dark-600 hover:!border-dark-400'
                    )}>
                    {loading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        Load More ({orders.length - visibleCount} remaining)
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default OrderHistory;
