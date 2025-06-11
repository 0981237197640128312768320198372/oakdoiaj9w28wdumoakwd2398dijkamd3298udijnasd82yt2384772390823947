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
  Eye,
  RefreshCw,
  Calendar,
  ShoppingBag,
  Copy,
  Key,
} from 'lucide-react';
import Image from 'next/image';
import { useBuyerAuth } from '@/hooks/useBuyerAuth';

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
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedAsset, setCopiedAsset] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAsset(text);
      setTimeout(() => setCopiedAsset(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

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
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'confirmed':
        return <Package size={16} className="text-blue-500" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertTriangle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 rounded-xl border',
          isLight ? 'bg-light-100 border-light-300' : 'bg-dark-700 border-dark-600'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={24} className={themeUtils.getPrimaryColorClass('text')} />
          <h2 className={cn('text-xl font-bold', isLight ? 'text-dark-800' : 'text-light-200')}>
            Order History
          </h2>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            themeUtils.getButtonClass(),
            loading && 'opacity-50 cursor-not-allowed'
          )}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
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
            'px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2',
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
              className={cn(
                'animate-pulse p-4 rounded-xl border',
                isLight ? 'bg-light-100 border-light-300' : 'bg-dark-700 border-dark-600'
              )}>
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
          <span>{error}</span>
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
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'p-4 rounded-xl border transition-all duration-200 hover:shadow-md',
                    isLight ? 'bg-light-100 border-light-300' : 'bg-dark-700 border-dark-600'
                  )}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'font-mono text-sm',
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
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar size={12} />
                        <span className={cn(isLight ? 'text-dark-600' : 'text-light-500')}>
                          {formatDate(order.timestamps.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Image
                          src={dokmaiCoin}
                          alt="Dokmai Coin"
                          width={16}
                          height={16}
                          className="h-4 w-auto"
                        />
                        <span
                          className={cn('font-bold', isLight ? 'text-dark-800' : 'text-light-200')}>
                          {order.totals.total.toLocaleString()}
                        </span>
                      </div>
                      <div className={cn('text-xs', isLight ? 'text-dark-600' : 'text-light-500')}>
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
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <span className={cn('text-sm', isLight ? 'text-dark-700' : 'text-light-300')}>
                        {order.seller.storeName || order.seller.username}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                        themeUtils.getButtonClass()
                      )}>
                      <Eye size={12} />
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
              themeUtils.getButtonClass()
            )}>
            Previous
          </button>

          <span className={cn('px-3 py-2 text-sm', isLight ? 'text-dark-600' : 'text-light-500')}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
              themeUtils.getButtonClass()
            )}>
            Next
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={cn(
              'max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl border',
              isLight ? 'bg-light-100 border-light-300' : 'bg-dark-700 border-dark-600'
            )}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={cn('text-lg font-bold', isLight ? 'text-dark-800' : 'text-light-200')}>
                  Order Details
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    isLight ? 'hover:bg-light-300' : 'hover:bg-dark-600'
                  )}>
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={cn(
                        'text-xs font-medium',
                        isLight ? 'text-dark-600' : 'text-light-500'
                      )}>
                      Order ID
                    </label>
                    <p className={cn('font-mono', isLight ? 'text-dark-800' : 'text-light-200')}>
                      {selectedOrder.orderId}
                    </p>
                  </div>
                  <div>
                    <label
                      className={cn(
                        'text-xs font-medium',
                        isLight ? 'text-dark-600' : 'text-light-500'
                      )}>
                      Status
                    </label>
                    <div
                      className={cn(
                        'flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-xs border w-fit',
                        getStatusColor(selectedOrder.status)
                      )}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="capitalize">{selectedOrder.status}</span>
                    </div>
                  </div>
                  <div>
                    <label
                      className={cn(
                        'text-xs font-medium',
                        isLight ? 'text-dark-600' : 'text-light-500'
                      )}>
                      Created
                    </label>
                    <p className={cn('text-sm', isLight ? 'text-dark-800' : 'text-light-200')}>
                      {formatDate(selectedOrder.timestamps.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label
                      className={cn(
                        'text-xs font-medium',
                        isLight ? 'text-dark-600' : 'text-light-500'
                      )}>
                      Total
                    </label>
                    <div className="flex items-center gap-1">
                      <Image
                        src={dokmaiCoin}
                        alt="Dokmai Coin"
                        width={16}
                        height={16}
                        className="h-4 w-auto"
                      />
                      <span
                        className={cn('font-bold', isLight ? 'text-dark-800' : 'text-light-200')}>
                        {selectedOrder.totals.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4
                    className={cn(
                      'font-semibold mb-3',
                      isLight ? 'text-dark-800' : 'text-light-200'
                    )}>
                    Items ({selectedOrder.items.length})
                  </h4>
                  {selectedOrder.status === 'completed' && (
                    <div>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, itemIndex) => {
                          if (!item.digitalAssets || item.digitalAssets.length === 0) {
                            return null;
                          }
                          return (
                            <div
                              key={itemIndex}
                              className={cn(
                                'p-4 rounded-xl border',
                                isLight
                                  ? 'bg-light-200 border-light-300'
                                  : 'bg-dark-600 border-dark-500'
                              )}>
                              <div className="flex items-center gap-2 mb-3">
                                <Package
                                  size={16}
                                  className={themeUtils.getPrimaryColorClass('text')}
                                />
                                <h5
                                  className={cn(
                                    'font-medium',
                                    isLight ? 'text-dark-800' : 'text-light-200'
                                  )}>
                                  {item.productTitle}
                                </h5>
                                <span
                                  className={cn(
                                    'text-xs px-2 py-1 rounded-full',
                                    isLight
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-green-900/30 text-green-300'
                                  )}>
                                  {item.digitalAssets.length} asset
                                  {item.digitalAssets.length > 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="grid gap-3">
                                {item.digitalAssets.map((asset, assetIndex) => (
                                  <div
                                    key={assetIndex}
                                    className={cn(
                                      'p-3 rounded-lg border transition-all duration-200',
                                      isLight
                                        ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:shadow-sm'
                                        : 'bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-700/50 hover:border-green-600'
                                    )}>
                                    <div>
                                      {(() => {
                                        const parsedValue = parseAssetValue(asset.value);

                                        if (parsedValue) {
                                          // Display parsed JSON as key-value pairs
                                          return (
                                            <div className="space-y-2">
                                              {Object.entries(parsedValue).map(
                                                ([key, value], index) => (
                                                  <div
                                                    key={index}
                                                    className={cn(
                                                      'flex items-center justify-between gap-3 p-3 rounded-lg border',
                                                      isLight
                                                        ? 'bg-white border-gray-200'
                                                        : 'bg-dark-700 border-dark-400'
                                                    )}>
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <span
                                                          className={cn(
                                                            'text-xs font-semibold uppercase tracking-wide',
                                                            isLight
                                                              ? 'text-gray-600'
                                                              : 'text-gray-400'
                                                          )}>
                                                          {key}:
                                                        </span>
                                                      </div>
                                                      <div
                                                        className={cn(
                                                          'font-mono text-sm break-all p-2 rounded border',
                                                          isLight
                                                            ? 'bg-gray-50 border-gray-100 text-gray-800'
                                                            : 'bg-dark-600 border-dark-500 text-light-200'
                                                        )}>
                                                        {String(value)}
                                                      </div>
                                                    </div>
                                                    <button
                                                      onClick={() => copyToClipboard(String(value))}
                                                      className={cn(
                                                        'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 hover:scale-105 flex-shrink-0',
                                                        isLight
                                                          ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200'
                                                          : 'bg-blue-800/50 hover:bg-blue-700 text-blue-200 border border-blue-600'
                                                      )}>
                                                      <Copy size={10} />
                                                      {copiedAsset === String(value)
                                                        ? 'Copied!'
                                                        : 'Copy'}
                                                    </button>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          );
                                        } else {
                                          // Display as regular text for non-JSON values
                                          return (
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="flex-1 min-w-0">
                                                <div
                                                  className={cn(
                                                    'p-2 rounded border font-mono text-sm break-all',
                                                    isLight
                                                      ? 'bg-white border-gray-200 text-gray-800'
                                                      : 'bg-dark-700 border-dark-400 text-light-200'
                                                  )}>
                                                  {asset.value}
                                                </div>
                                              </div>
                                              <button
                                                onClick={() => copyToClipboard(asset.value)}
                                                className={cn(
                                                  'flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 flex-shrink-0',
                                                  isLight
                                                    ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200'
                                                    : 'bg-blue-800/50 hover:bg-blue-700 text-blue-200 border border-blue-600'
                                                )}>
                                                <Copy size={12} />
                                                {copiedAsset === asset.value
                                                  ? 'Copied!'
                                                  : 'Copy Value'}
                                              </button>
                                            </div>
                                          );
                                        }
                                      })()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        {selectedOrder.items.every(
                          (item) => !item.digitalAssets || item.digitalAssets.length === 0
                        ) && (
                          <div
                            className={cn(
                              'text-center p-6 rounded-xl border',
                              isLight
                                ? 'bg-gray-50 border-gray-200 text-gray-600'
                                : 'bg-gray-800 border-gray-700 text-gray-400'
                            )}>
                            <Key size={32} className="mx-auto mb-3 opacity-50" />
                            <h5 className="font-medium mb-1">No Digital Assets</h5>
                            <p className="text-sm opacity-75">
                              No digital assets are available for this order
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
