'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Filter,
  User,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { useSellerOrders } from '@/hooks/useSellerOrders';

const SellerOrders = () => {
  const { seller } = useSellerAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  const { orders, pagination, loading, error, refetch } = useSellerOrders(
    seller?._id || null,
    currentPage,
    statusFilter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'cancelled':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
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

  if (loading && orders.length === 0) {
    return (
      <div className="w-full animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-light-100">Recent Orders</h1>
        </div>
        <div className="bg-dark-600 border border-dark-400 rounded-xl p-6 text-center">
          <Loader2 size={32} className="mx-auto text-light-500 mb-4 animate-spin" />
          <p className="text-light-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-light-100">Recent Orders</h1>
        </div>
        <div className="bg-dark-600 border border-dark-400 rounded-xl p-6 text-center">
          <XCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-light-100 mb-2">Error Loading Orders</h2>
          <p className="text-light-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-light-100">Recent Orders</h1>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-dark-600 border border-dark-400 text-light-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="flex items-center gap-2 bg-dark-600 hover:bg-dark-500 text-light-100 text-sm rounded-full px-4 py-2 font-bold border border-dark-400 transition-all duration-300">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-dark-600 border border-dark-400 rounded-xl p-6 text-center">
          <ShoppingBag size={64} className="mx-auto text-light-500 mb-4" />
          <h2 className="text-xl font-bold text-light-100 mb-2">No Orders Yet</h2>
          <p className="text-light-500 mb-4">When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-dark-600 border border-dark-400 rounded-xl p-6 hover:bg-dark-500 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-600/20 p-2 rounded-lg">
                    <ShoppingBag size={20} className="text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-light-100">{order.orderId}</h3>
                    <p className="text-sm text-light-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <User size={16} className="text-light-500" />
                <div>
                  <p className="text-light-100 font-medium">{order.buyer.name}</p>
                  <p className="text-sm text-light-500">{order.buyer.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-dark-700 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Package size={16} className="text-light-500" />
                      <div>
                        <p className="text-light-100 font-medium">{item.productTitle}</p>
                        <p className="text-sm text-light-500">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-light-100 font-bold">{item.totalPrice.toLocaleString()}</p>
                      <p className="text-sm text-light-500">
                        {item.unitPrice.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-dark-400">
                <div className="text-sm text-light-500">
                  Payment:{' '}
                  <span
                    className={`font-medium ${
                      order.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-light-100">
                    {order.totals.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-light-500">Total Amount</p>
                </div>
              </div>
            </div>
          ))}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-dark-600 border border-dark-400 text-light-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-500 transition-colors">
                Previous
              </button>
              <span className="text-light-100 px-4">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-dark-600 border border-dark-400 text-light-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-500 transition-colors">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
