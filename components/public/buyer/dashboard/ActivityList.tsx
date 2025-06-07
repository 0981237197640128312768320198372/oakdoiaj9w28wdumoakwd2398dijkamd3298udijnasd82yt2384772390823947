/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Wallet,
  MessageSquare,
  History,
  Globe,
  Info,
  Calendar,
  User,
  Tag,
  Layers,
  Monitor,
  Cpu,
  MapPin,
  Mail,
  Phone,
  Hash,
  CreditCard,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface ActivityListProps {
  activities: any[];
  loading: boolean;
  error: string | null;
  pagination: any;
  activeTab: string;
  filter: any;
  onFilterChange: (filter: any) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  theme: ThemeType | null;
}

// Helper type for metadata keys
type MetadataKey = string;

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  loading,
  error,
  pagination,
  activeTab,
  filter,
  onFilterChange,
  onLoadMore,
  onRefresh,
  theme,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filter.search || '');
  const [expandedActivities, setExpandedActivities] = useState<Record<string, boolean>>({});
  const themeUtils = useThemeUtils(theme);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatIpAddress = (ip: string) => {
    // Simple validation to check if it looks like an IP address
    const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
    const isIPv6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip);

    if (!isIPv4 && !isIPv6) {
      return ip; // Return as is if not a valid format
    }

    return ip;
  };

  const toggleActivityExpand = (activityId: string) => {
    setExpandedActivities((prev) => ({
      ...prev,
      [activityId]: !prev[activityId],
    }));
  };

  const getStatusIcon = (status: string) => {
    const iconProps = {
      size: 16,
      className: cn(
        status === 'completed' && themeUtils.getPrimaryColorClass('text'),
        status === 'pending' && 'text-yellow-500',
        status === 'failed' && 'text-red-500',
        status === 'cancelled' && 'text-orange-500',
        status === 'processing' && themeUtils.getPrimaryColorClass('text')
      ),
    };

    switch (status) {
      case 'completed':
        return <CheckCircle {...iconProps} />;
      case 'pending':
        return <Clock {...iconProps} />;
      case 'failed':
        return <XCircle {...iconProps} />;
      case 'cancelled':
        return <XCircle {...iconProps} />;
      case 'processing':
        return <RefreshCw {...iconProps} className={cn(iconProps.className, 'animate-spin')} />;
      default:
        return <AlertCircle {...iconProps} />;
    }
  };

  const getActivityIcon = (type: string, category: string) => {
    const iconProps = {
      size: 18,
      className: cn(themeUtils.getPrimaryColorClass('text')),
    };

    if (category === 'financial') {
      switch (type) {
        case 'deposit':
          return <Wallet {...iconProps} />;
        case 'purchase':
          return <ShoppingBag {...iconProps} />;
        default:
          return <Wallet {...iconProps} />;
      }
    } else if (category === 'interaction') {
      switch (type) {
        case 'review':
          return <Star {...iconProps} />;
        case 'message':
          return <MessageSquare {...iconProps} />;
        default:
          return <MessageSquare {...iconProps} />;
      }
    } else if (category === 'system') {
      switch (type) {
        case 'login':
          return <User {...iconProps} />;
        case 'update':
          return <RefreshCw {...iconProps} />;
        case 'registration':
          return <User {...iconProps} />;
        default:
          return <Cpu {...iconProps} />;
      }
    }
    return <History {...iconProps} />;
  };

  const getActivityDescription = (activity: any) => {
    const { type, category, metadata } = activity;
    if (category === 'financial') {
      switch (type) {
        case 'deposit':
          return `เติมเงิน ${metadata.amount} Dokmai Coin`;
        case 'purchase':
          return `ซื้อ ${metadata.productName || 'สินค้าที่ไม่รู้จัก'}`;
        default:
          return `${type.charAt(0).toUpperCase() + type.slice(1)} การชำระเงิน`;
      }
    } else if (category === 'interaction') {
      switch (type) {
        case 'review':
          return `รีวิว: ${metadata.rating}/5 ดาว`;
        case 'message':
          return `ข้อความ: ${metadata.subject || 'ไม่มีหัวข้อ'}`;
        default:
          return `${type.charAt(0).toUpperCase() + type.slice(1)} การโต้ตอบ`;
      }
    } else if (category === 'system') {
      switch (type) {
        case 'login':
          return `เข้าสู่ระบบ`;
        case 'logout':
          return `ออกจากระบบ`;
        case 'update':
          return `Profile update`;
        case 'registration':
          return `การลงทะเบียน`;
        default:
          return `${type.charAt(0).toUpperCase() + type.slice(1)} system activity`;
      }
    }
    return `${type.charAt(0).toUpperCase() + type.slice(1)} กิจกรรม`;
  };

  // Function to get metadata display name
  const getMetadataDisplayName = (key: MetadataKey): string => {
    const displayNames: Record<string, string> = {
      ipAddress: 'IP Address',
      amount: 'จำนวน',
      paymentMethod: 'วิธีการชำระเงิน',
      transactionId: 'ID การชำระเงิน',
      rating: 'คะแนน',
      comment: 'คอมเมนต์',
      creditType: 'Credit Type',
      creditValue: 'Credit Value',
      productId: 'ID สินค้า',
      productName: 'ชื่อสินค้า',
      quantity: 'จำนวน',
      price: 'ราคา',
      orderId: 'ID คำสั่งซื้อ',
      orderNumber: 'เลขคำสั่งซื้อ',
      browser: 'Browser',
      device: 'Device',
      os: 'Operating System',
      location: 'โลเคชั่น',
      email: 'Email',
      userAgent: 'User Agent',
    };

    return (
      displayNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
    );
  };

  // Function to get metadata icon
  const getMetadataIcon = (key: MetadataKey) => {
    const iconProps = {
      size: 14,
      className: themeUtils.getPrimaryColorClass('text'),
    };

    const icons: Record<string, React.ReactNode> = {
      ipAddress: <Globe {...iconProps} />,
      amount: <DollarSign {...iconProps} />,
      paymentMethod: <CreditCard {...iconProps} />,
      transactionId: <Hash {...iconProps} />,
      rating: <Star {...iconProps} />,
      comment: <MessageSquare {...iconProps} />,
      productId: <Tag {...iconProps} />,
      productName: <Layers {...iconProps} />,
      quantity: <Layers {...iconProps} />,
      price: <DollarSign {...iconProps} />,
      orderId: <Hash {...iconProps} />,
      orderNumber: <Hash {...iconProps} />,
      browser: <Monitor {...iconProps} />,
      device: <Monitor {...iconProps} />,
      os: <Monitor {...iconProps} />,
      location: <MapPin {...iconProps} />,
      email: <Mail {...iconProps} />,
      phone: <Phone {...iconProps} />,
      userAgent: <Monitor {...iconProps} />,
      createdAt: <Calendar {...iconProps} />,
      updatedAt: <Calendar {...iconProps} />,
    };

    return icons[key] || <Info {...iconProps} />;
  };

  const isLight = themeUtils.baseTheme === 'light';

  const formatMetadataValue = (key: MetadataKey, value: any): React.ReactNode => {
    if (value === null || value === undefined) return 'N/A';

    if (key === 'ipAddress') {
      return (
        <span
          className={cn(
            'font-mono px-1.5 py-0.5 rounded',
            themeUtils.baseTheme === 'light' ? 'bg-light-100' : 'bg-dark-600'
          )}>
          {formatIpAddress(value)}
        </span>
      );
    }

    if ((key === 'amount' || key === 'price') && typeof value === 'number') {
      return <span className="font-medium">{value}</span>;
    }

    // Format dates
    if (key === 'createdAt' || key === 'updatedAt' || key === 'completedAt') {
      return (
        <span className="flex items-center gap-1">
          <Calendar size={12} className={themeUtils.getPrimaryColorClass('text')} />
          {formatDate(value)}
        </span>
      );
    }

    // Format boolean values
    if (typeof value === 'boolean') {
      return value ? (
        <span
          className={cn(
            'px-1.5 py-0.5 rounded-full text-xs',
            themeUtils.baseTheme === 'light'
              ? 'bg-green-100 text-green-800'
              : 'bg-green-900/30 text-green-300'
          )}>
          Yes
        </span>
      ) : (
        <span
          className={cn(
            'px-1.5 py-0.5 rounded-full text-xs',
            themeUtils.baseTheme === 'light'
              ? 'bg-red-100 text-red-800'
              : 'bg-red-900/30 text-red-300'
          )}>
          No
        </span>
      );
    }

    // Format location object
    if (key === 'location' && typeof value === 'object') {
      try {
        const locationObj = typeof value === 'string' ? JSON.parse(value) : value;
        return (
          <div className="flex flex-col space-y-1">
            {locationObj.country && (
              <span className="flex items-center gap-1">
                <MapPin size={12} className={themeUtils.getPrimaryColorClass('text')} />
                {locationObj.city
                  ? `${locationObj.city}, ${locationObj.country}`
                  : locationObj.country}
              </span>
            )}
            {locationObj.postal && (
              <span className="text-xs  ml-4">Postal: {locationObj.postal}</span>
            )}
            {locationObj.coordinate && (
              <span className="text-xs  ml-4 font-mono">
                {typeof locationObj.coordinate === 'string'
                  ? locationObj.coordinate
                  : Array.isArray(locationObj.coordinate)
                  ? `${locationObj.coordinate[0]}, ${locationObj.coordinate[1]}`
                  : JSON.stringify(locationObj.coordinate)}
              </span>
            )}
          </div>
        );
      } catch (e) {
        // Fallback if parsing fails
        return String(value);
      }
    }

    // Format user agent
    if (key === 'userAgent' && typeof value === 'string') {
      // Extract browser and OS info from user agent
      let browserInfo = value;
      if (value.length > 40) {
        // Try to extract the most relevant part
        const parts = value.split(' ');
        if (parts.length > 2) {
          browserInfo = parts.slice(-2).join(' ');
        } else {
          browserInfo = value.substring(0, 40) + '...';
        }
      }

      return (
        <span className="flex items-center gap-1">
          <Monitor size={12} className={themeUtils.getPrimaryColorClass('text')} />
          {browserInfo}
        </span>
      );
    }

    // Format other objects more elegantly
    if (typeof value === 'object') {
      try {
        const obj = typeof value === 'string' ? JSON.parse(value) : value;
        return (
          <div className="flex flex-col space-y-1 text-xs">
            {Object.entries(obj).map(([objKey, objValue]) => (
              <div key={objKey} className="flex items-start gap-1">
                <span className={cn('font-medium', themeUtils.getPrimaryColorClass('text'))}>
                  {objKey.charAt(0).toUpperCase() + objKey.slice(1)}:
                </span>
                <span>
                  {typeof objValue === 'object'
                    ? JSON.stringify(objValue).substring(0, 30) +
                      (JSON.stringify(objValue).length > 30 ? '...' : '')
                    : String(objValue)}
                </span>
              </div>
            ))}
          </div>
        );
      } catch (e) {
        // Fallback if parsing fails
        return String(value);
      }
    }

    return String(value);
  };

  const filteredActivities = activities.filter((activity) => {
    if (activeTab === 'transactions') return activity.category === 'financial';
    if (activeTab === 'interactions') return activity.category === 'interaction';
    return true;
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    onFilterChange({ ...filter, search: term });
  };

  return (
    <div
      className={cn(
        'p-5 border backdrop-blur-sm transition-all duration-300',
        themeUtils.getCardClass(),
        themeUtils.getComponentRoundednessClass(),
        themeUtils.getComponentShadowClass()
      )}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-3 sm:mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <History size={16} className={themeUtils.getPrimaryColorClass('text')} />
          <span className={themeUtils.getTextColors()}>
            {activeTab === 'transactions'
              ? 'เกี่ยวกับการเงิน'
              : activeTab === 'interactions'
              ? 'การโต้ตอบ'
              : 'กิจกรรมทั้งหมด'}
          </span>
        </h3>

        <div className="flex items-center gap-5">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-light-700"
            />
            <input
              type="text"
              placeholder="การค้นหา..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={cn(
                'pl-8 pr-3 py-1.5 text-xs border transition-all duration-300 focus:outline-none focus:ring-0',
                themeUtils.getCardClass(),
                themeUtils.getComponentRoundednessClass(),
                themeUtils.getPrimaryColorClass('border'),
                'w-28 sm:w-40'
              )}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-all duration-300',
              themeUtils.getCardClass(),
              themeUtils.getComponentRoundednessClass(),
              'border hover:shadow-sm'
            )}>
            <Filter size={14} className={themeUtils.getPrimaryColorClass('text')} />
            <span className="hidden sm:inline">ตัวกรอง</span>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-all duration-300',
              themeUtils.getCardClass(),
              themeUtils.getComponentRoundednessClass(),
              'border hover:shadow-sm disabled:opacity-50'
            )}>
            <RefreshCw
              size={14}
              className={cn(loading && 'animate-spin', themeUtils.getPrimaryColorClass('text'))}
            />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'mb-3 sm:mb-4 p-2 sm:p-3 border rounded-lg',
              themeUtils.baseTheme === 'light'
                ? 'bg-light-100 border-light-300'
                : 'bg-dark-600 border-dark-400'
            )}>
            <div className="flex flex-wrap gap-5">
              <select
                value={filter.category || ''}
                onChange={(e) =>
                  onFilterChange({ ...filter, category: e.target.value || undefined })
                }
                className={cn(
                  'px-2 py-1 text-xs border transition-all duration-300',
                  themeUtils.getCardClass(),
                  themeUtils.getComponentRoundednessClass()
                )}>
                <option value="">หมวดหมู่ทั้งหมด</option>
                <option value="financial">เกี่ยวกับการเงิน</option>
                <option value="interaction">การโต้ตอบ</option>
                <option value="system">ระบบ</option>
              </select>

              <select
                value={filter.type || ''}
                onChange={(e) => onFilterChange({ ...filter, type: e.target.value || undefined })}
                className={cn(
                  'px-2 py-1 text-xs border transition-all duration-300',
                  themeUtils.getCardClass(),
                  themeUtils.getComponentRoundednessClass()
                )}>
                <option value="">กิจกรรมทั้งหมด</option>
                <option value="deposit">เติมเงิน</option>
                <option value="purchase">ซื้อ</option>
                <option value="review">รีวิว</option>
                <option value="login">เข้าสู่ระบบ</option>
                <option value="registration">การลงทะเบียน</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mb-3 sm:mb-4 p-5 text-xs border-l-4 flex items-center gap-5',
            themeUtils.getComponentRoundednessClass(),
            'bg-red-500/20 border-red-400 text-red-700  '
          )}>
          <AlertCircle size={14} />
          {error}
        </motion.div>
      )}

      {loading && filteredActivities.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <RefreshCw
            size={20}
            className={cn('animate-spin mx-auto mb-2', themeUtils.getPrimaryColorClass('text'))}
          />
          <p className="text-xs  ">กำลังโหลดกิจกรรม...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <History
            size={20}
            className={cn('mx-auto mb-2', themeUtils.getPrimaryColorClass('text'))}
          />
          <p className={cn('text-xs', themeUtils.getTextColors())}>ไม่พบกิจกรรม</p>
        </div>
      ) : (
        <div className="space-y-5">
          <AnimatePresence>
            {filteredActivities.map((activity, index) => (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleActivityExpand(activity.id);
                }}
                key={activity.id}
                className="gap-1 flex-col flex cursor-pointer">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    'flex items-center justify-between p-2 sm:p-3 border transition-all duration-300 hover:shadow-sm',
                    themeUtils.getCardClass(),
                    themeUtils.getComponentRoundednessClass(),
                    isLight ? '!bg-gray-50' : '!bg-dark-600'
                  )}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type, activity.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-xs font-medium truncate', themeUtils.getTextColors())}>
                        {getActivityDescription(activity)}
                      </p>
                      <div
                        className={cn(
                          'flex flex-wrap items-center gap-1 sm:gap-2 text-xs mt-0.5',
                          themeUtils.getTextColors()
                        )}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(activity.status)}
                          <span className="capitalize">{activity.status}</span>
                        </div>

                        {activity.metadata.ipAddress && (
                          <div
                            className={cn(
                              'flex items-center gap-1 ml-1 sm:ml-2 px-1.5 py-0.5 rounded border',
                              themeUtils.baseTheme === 'light'
                                ? ' bg-light-100 border-light-400'
                                : ' bg-dark-600 border-dark-400',
                              themeUtils.getTextColors()
                            )}>
                            <Globe size={12} className={themeUtils.getPrimaryColorClass('text')} />
                            <span className="font-mono text-xs">
                              {formatIpAddress(activity.metadata.ipAddress)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActivityExpand(activity.id);
                        }}
                        className={cn(
                          'p-1 rounded-full transition-colors',
                          themeUtils.baseTheme === 'light'
                            ? 'hover:bg-light-800'
                            : 'hover:bg-dark-600',
                          expandedActivities[activity.id] &&
                            (themeUtils.baseTheme === 'light' ? 'bg-light-300' : 'bg-dark-500')
                        )}>
                        {expandedActivities[activity.id] ? (
                          <ChevronDown
                            size={16}
                            className={themeUtils.getPrimaryColorClass('text')}
                          />
                        ) : (
                          <ChevronRight
                            size={16}
                            className={themeUtils.getPrimaryColorClass('text')}
                          />
                        )}
                      </button>
                    </div>

                    {activity.metadata.rating && (
                      <div className="flex items-center gap-0.5 justify-end">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={cn(
                              i < activity.metadata.rating! ? 'text-yellow-400 fill-current' : '',
                              themeUtils.getTextColors()
                            )}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-light-800  mt-0.5">
                      <Calendar size={12} className={themeUtils.getPrimaryColorClass('text')} />
                      <span>{formatDate(activity.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {expandedActivities[activity.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'w-full p-3 border',
                        themeUtils.getCardClass(),
                        isLight ? '!bg-gray-50' : '!bg-dark-600',
                        themeUtils.getComponentRoundednessClass()
                      )}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2 text-xs">
                            <div className="flex items-center gap-1  min-w-[100px] sm:min-w-[120px]">
                              {getMetadataIcon(key)}
                              <span>{getMetadataDisplayName(key)}:</span>
                            </div>
                            <div className={cn('font-medium', themeUtils.getTextColors())}>
                              {formatMetadataValue(key, value)}
                            </div>
                          </div>
                        ))}

                        {/* Activity Details */}
                        <div className="flex items-start gap-2 text-xs">
                          <div className="flex items-center gap-1 min-w-[100px] sm:min-w-[120px]">
                            <Calendar
                              size={14}
                              className={themeUtils.getPrimaryColorClass('text')}
                            />
                            <span>วันที่</span>
                          </div>
                          <div className={cn('font-medium', themeUtils.getTextColors())}>
                            {formatDate(activity.createdAt)}
                          </div>
                        </div>

                        {activity.completedAt && (
                          <div className="flex items-start gap-2 text-xs">
                            <div
                              className={cn(
                                'flex items-center gap-1 min-w-[100px] sm:min-w-[120px]',
                                themeUtils.getTextColors()
                              )}>
                              <Calendar
                                size={14}
                                className={themeUtils.getPrimaryColorClass('text')}
                              />
                              <span>เสร็จสิ้น</span>
                            </div>
                            <div className={cn('font-medium', themeUtils.getTextColors())}>
                              {formatDate(activity.completedAt)}
                            </div>
                          </div>
                        )}

                        {activity.tags && activity.tags.length > 0 && (
                          <div className="flex items-start gap-2 text-xs col-span-1 sm:col-span-2">
                            <div
                              className={cn(
                                'flex items-center gap-1  min-w-[100px] sm:min-w-[120px]',
                                themeUtils.getTextColors()
                              )}>
                              <Tag size={14} className={themeUtils.getPrimaryColorClass('text')} />
                              <span>แท็ก</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {activity.tags.map((tag: string) => (
                                <span
                                  key={tag}
                                  className={cn(
                                    'px-2 py-0.5 rounded-full text-xs',
                                    themeUtils.baseTheme === 'light'
                                      ? 'bg-light-300'
                                      : 'bg-dark-600',
                                    themeUtils.getTextColors()
                                  )}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {activity.notes && (
                          <div className="flex items-start gap-2 text-xs col-span-1 sm:col-span-2">
                            <div className="flex items-center gap-1  min-w-[100px] sm:min-w-[120px]">
                              <MessageSquare
                                size={14}
                                className={themeUtils.getPrimaryColorClass('text')}
                              />
                              <span>โน้ต</span>
                            </div>
                            <div className={cn('font-medium', themeUtils.getTextColors())}>
                              {activity.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </AnimatePresence>

          {pagination.hasMore && (
            <div className="text-center pt-3">
              <button
                onClick={onLoadMore}
                disabled={loading}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all duration-300 mx-auto',
                  themeUtils.getButtonClass(),
                  themeUtils.getComponentRoundednessClass(),
                  'disabled:opacity-50'
                )}>
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    กำลังโหลด...
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    โหลดเพิ่มเติม
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
