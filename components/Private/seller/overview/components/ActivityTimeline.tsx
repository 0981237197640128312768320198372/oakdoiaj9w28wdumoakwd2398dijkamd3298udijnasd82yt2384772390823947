/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from 'react';
import {
  Loader2,
  ShoppingBag,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  CreditCard,
  AlertTriangle,
  User,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityTimelineProps {
  orders: any[];
  loading: boolean;
}

interface TimelineActivity {
  id: string;
  type:
    | 'order_created'
    | 'order_confirmed'
    | 'order_completed'
    | 'order_cancelled'
    | 'payment_received';
  timestamp: string;
  order: any;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  title: string;
  description: string;
}

export function ActivityTimeline({ orders, loading }: ActivityTimelineProps) {
  const activities = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const timelineActivities: TimelineActivity[] = [];

    orders.forEach((order) => {
      // Add order creation activity
      timelineActivities.push({
        id: `${order._id}-created`,
        type: 'order_created',
        timestamp: order.createdAt,
        order,
        icon: 'ShoppingBag',
        color: 'blue',
        title: 'New Order',
        description: `Order #${order.orderId || 'Unknown'} • ฿${order.totals?.total || 0}`,
      });

      // Add order confirmation activity
      if (order.confirmedAt) {
        timelineActivities.push({
          id: `${order._id}-confirmed`,
          type: 'order_confirmed',
          timestamp: order.confirmedAt,
          order,
          icon: 'CheckCircle',
          color: 'green',
          title: 'Order Confirmed',
          description: `Order #${order.orderId || 'Unknown'} confirmed`,
        });
      }

      // Add payment received activity
      if (order.paymentStatus === 'paid') {
        timelineActivities.push({
          id: `${order._id}-payment`,
          type: 'payment_received',
          timestamp: order.confirmedAt || order.updatedAt,
          order,
          icon: 'CreditCard',
          color: 'green',
          title: 'Payment Received',
          description: `฿${order.totals?.total || 0} payment confirmed`,
        });
      }

      // Add order completion activity
      if (order.completedAt) {
        timelineActivities.push({
          id: `${order._id}-completed`,
          type: 'order_completed',
          timestamp: order.completedAt,
          order,
          icon: 'Package',
          color: 'green',
          title: 'Order Completed',
          description: `Order #${order.orderId || 'Unknown'} delivered`,
        });
      }

      // Add order cancellation activity
      if (order.status === 'cancelled' && order.cancelledAt) {
        timelineActivities.push({
          id: `${order._id}-cancelled`,
          type: 'order_cancelled',
          timestamp: order.cancelledAt,
          order,
          icon: 'XCircle',
          color: 'red',
          title: 'Order Cancelled',
          description: `Order #${order.orderId || 'Unknown'} cancelled`,
        });
      }
    });

    return timelineActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [orders]);

  const getActivityIcon = (iconName: string, color: string) => {
    const iconProps = {
      size: 14,
      className: cn(
        'flex-shrink-0',
        color === 'blue' && 'text-blue-500',
        color === 'green' && 'text-green-500',
        color === 'yellow' && 'text-yellow-500',
        color === 'red' && 'text-red-500',
        color === 'purple' && 'text-purple-500'
      ),
    };

    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag {...iconProps} />;
      case 'CheckCircle':
        return <CheckCircle {...iconProps} />;
      case 'Clock':
        return <Clock {...iconProps} />;
      case 'XCircle':
        return <XCircle {...iconProps} />;
      case 'Package':
        return <Package {...iconProps} />;
      case 'CreditCard':
        return <CreditCard {...iconProps} />;
      case 'AlertTriangle':
        return <AlertTriangle {...iconProps} />;
      default:
        return <ShoppingBag {...iconProps} />;
    }
  };

  const getTimelineDot = (color: string) => {
    return (
      <div className="flex-shrink-0 relative">
        <div
          className={cn(
            'w-2 h-2 rounded-full border-2 bg-light-800',
            color === 'blue' && 'border-blue-500',
            color === 'green' && 'border-green-500',
            color === 'yellow' && 'border-yellow-500',
            color === 'red' && 'border-red-500',
            color === 'purple' && 'border-purple-500'
          )}
        />
      </div>
    );
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return activityTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getBuyerInfo = (order: any) => {
    // Handle the formatted buyer object from API
    if (order.buyer && typeof order.buyer === 'object') {
      // Prioritize name field first, then username as fallback
      if (order.buyer.name && order.buyer.name.trim()) {
        return order.buyer.name;
      }
      if (order.buyer.username && order.buyer.username.trim()) {
        return order.buyer.username;
      }
      if (order.buyer.email && order.buyer.email.trim()) {
        return order.buyer.email;
      }
    }

    // Handle populated buyerId object (fallback)
    if (order.buyerId && typeof order.buyerId === 'object') {
      if (order.buyerId.name && order.buyerId.name.trim()) {
        return order.buyerId.name;
      }
      if (order.buyerId.username && order.buyerId.username.trim()) {
        return order.buyerId.username;
      }
      if (order.buyerId.email && order.buyerId.email.trim()) {
        return order.buyerId.email;
      }
    }

    // Handle direct buyer fields on order (fallback)
    if (order.buyerName && order.buyerName.trim()) return order.buyerName;
    if (order.buyerEmail && order.buyerEmail.trim()) return order.buyerEmail;

    return 'Buyer';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center gap-2">
          <Clock className="w-8 h-8 text-light-500" />
          <p className="text-xs text-light-500">No recent activity</p>
          <p className="text-xs text-light-600">Your store activities will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="max-h-64 overflow-y-auto p-3 bg-dark-600  rounded-xl scrollbar-thin scrollbar-thumb-light-400 scrollbar-track-transparent __dokmai_scrollbar">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative ">
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div className="absolute left-1 top-6 w-px h-12 bg-dark-300" />
            )}

            {/* Activity item */}
            <div className="flex items-start gap-3 py-2">
              {/* Timeline dot */}
              {getTimelineDot(activity.color)}

              {/* Activity content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getActivityIcon(activity.icon, activity.color)}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{activity.title}</p>
                      <p className="text-xs text-light-400 truncate">{activity.description}</p>
                      {activity.type === 'order_created' && (
                        <div className="flex items-center gap-1 mt-1">
                          <User className="w-3 h-3 text-light-500" />
                          <span className="text-xs text-light-500 truncate">
                            {getBuyerInfo(activity.order)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Calendar className="w-3 h-3 text-light-500" />
                    <span className="text-xs text-light-500">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
