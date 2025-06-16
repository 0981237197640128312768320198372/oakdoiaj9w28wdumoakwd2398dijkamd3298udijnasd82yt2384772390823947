'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Filter,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Key,
  Search,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { useSellerOrders } from '@/hooks/useSellerOrders';
import Image from 'next/image';
import { dokmaiCoinSymbol } from '@/lib/utils';
import AssetsModal from '@/components/private/seller/AssetsModal';

const SellerOrders: React.FC = () => {
  const { seller } = useSellerAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAssetItem, setSelectedAssetItem] = useState<{
    orderId: string;
    productTitle: string;
    digitalAssets: { key: string; value: string }[];
  } | null>(null);

  const dokmaiCoin = dokmaiCoinSymbol(false);
  const { orders, pagination, loading, error, refetch } = useSellerOrders(
    seller?._id || null,
    currentPage,
    statusFilter
  );

  const openAssetsModal = (
    orderId: string,
    productTitle: string,
    digitalAssets: { key: string; value: string }[]
  ) => {
    setSelectedAssetItem({
      orderId,
      productTitle,
      digitalAssets,
    });
  };

  const closeAssetsModal = () => {
    setSelectedAssetItem(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={10} className="text-yellow-500" />;
      case 'confirmed':
        return <Package size={10} className="text-blue-500" />;
      case 'completed':
        return <CheckCircle size={10} className="text-green-500" />;
      case 'cancelled':
        return <XCircle size={10} className="text-red-500" />;
      default:
        return <Package size={10} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500';
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderId.toLowerCase().includes(query) ||
      order.buyer.name.toLowerCase().includes(query) ||
      (order.buyer.username && order.buyer.username.toLowerCase().includes(query)) ||
      order.items.some((item) => item.productTitle.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4 text-xs">{error}</p>
        <button
          onClick={refetch}
          className="px-3 py-2 bg-primary-600 text-white rounded text-xs hover:bg-primary-700 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* Header Controls */}
      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-light-100">Orders</h2>

        <div className="flex flex-col sm:flex-row gap-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-500"
            />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-dark-700 border border-dark-600 rounded text-xs text-light-100 placeholder-light-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-light-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded px-3 py-2 text-light-100 text-xs focus:outline-none focus:border-primary-500">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-3 py-2 bg-dark-700 border border-dark-600 rounded text-xs text-light-100 hover:bg-dark-600 transition-colors">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag size={32} className="mx-auto text-light-500 mb-4" />
          <h3 className="text-sm font-bold text-light-200 mb-2">No orders found</h3>
          <p className="text-xs text-light-500">
            {searchQuery ? 'No orders match your search.' : 'You have no orders yet.'}
          </p>
        </div>
      ) : (
        <div className="w-full grid lg:grid-cols-2 gap-5">
          {filteredOrders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col w-full gap-3 rounded-lg border border-dark-600 bg-dark-700 p-5">
              {/* Header */}
              <div className="flex w-full justify-between items-start pb-3 border-b border-dark-600">
                <div className="flex flex-col">
                  <h3 className="font-bold text-white text-xs">{order.orderId}</h3>
                  <p className="text-xs text-light-500">{formatDate(order.createdAt)}</p>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 text-xs border rounded ${getStatusColor(
                    order.status
                  )}`}>
                  {getStatusIcon(order.status)}
                  <span className="capitalize font-bold">{order.status}</span>
                </div>
              </div>

              {/* Buyer Info */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  {order.buyer.avatarUrl ? (
                    <Image
                      src={order.buyer.avatarUrl}
                      alt={order.buyer.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover border border-dark-500"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary-600/20 border border-dark-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-400">
                        {getInitials(order.buyer.name)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-light-100 truncate">{order.buyer.name}</p>
                  {order.buyer.username && (
                    <p className="text-xs text-light-500 truncate">@{order.buyer.username}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-col w-full">
                {order.items.map((item, j) => (
                  <div
                    key={j}
                    className="flex flex-col w-full p-5 rounded-lg border-b bg-dark-600 border-dark-600 last:border-b-0">
                    <div className="flex w-full justify-between items-center">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Package size={12} className="text-light-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-light-100 truncate">
                            {item.productTitle}
                          </p>
                          <p className="text-xs text-light-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image
                          src={dokmaiCoin}
                          alt="Dokmai Coin"
                          width={20}
                          height={20}
                          className="h-4 w-auto"
                        />
                        <span className="font-medium"> {item.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Digital Assets */}
                    {item.digitalAssets && item.digitalAssets.length > 0 && (
                      <div className="mt-3 w-full text-center">
                        <button
                          onClick={() =>
                            openAssetsModal(order.orderId, item.productTitle, item.digitalAssets)
                          }
                          className="flex items-center gap-2 text-xs text-light-400 hover:text-light-300 transition-colors">
                          <Key size={10} />
                          <span>View Assets ({item.digitalAssets.length})</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-5 mt-5">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded text-xs text-light-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors">
            Previous
          </button>
          <span className="text-xs text-light-300">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded text-xs text-light-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors">
            Next
          </button>
        </div>
      )}

      {/* Assets Modal */}
      {selectedAssetItem && (
        <AssetsModal
          isOpen={!!selectedAssetItem}
          onClose={closeAssetsModal}
          orderId={selectedAssetItem.orderId}
          productTitle={selectedAssetItem.productTitle}
          digitalAssets={selectedAssetItem.digitalAssets}
        />
      )}
    </div>
  );
};

export default SellerOrders;
