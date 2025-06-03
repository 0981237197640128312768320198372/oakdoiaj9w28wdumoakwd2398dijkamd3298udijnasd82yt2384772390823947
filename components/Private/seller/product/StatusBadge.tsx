'use client';
import React from 'react';
import { Check, AlertTriangle, Link, Link2Off, Package, ShoppingBag } from 'lucide-react';

type StatusType = 'linked' | 'unlinked' | 'active' | 'draft' | 'available' | 'out-of-stock';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, size = 'md', className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'linked':
        return {
          icon: Link,
          bg: 'bg-primary/10',
          border: 'border-primary/30',
          text: 'text-primary',
          defaultText: 'Linked',
        };
      case 'unlinked':
        return {
          icon: Link2Off,
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          defaultText: 'Unlinked',
        };
      case 'active':
        return {
          icon: Check,
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          text: 'text-green-400',
          defaultText: 'Active',
        };
      case 'draft':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          defaultText: 'Draft',
        };
      case 'available':
        return {
          icon: ShoppingBag,
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          text: 'text-green-400',
          defaultText: 'Available',
        };
      case 'out-of-stock':
        return {
          icon: Package,
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          text: 'text-red-400',
          defaultText: 'Out of Stock',
        };
      default:
        return {
          icon: AlertTriangle,
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          defaultText: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 rounded-md',
    md: 'text-xs px-2 py-1 rounded-lg',
    lg: 'text-sm px-3 py-1.5 rounded-lg',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <div
      className={`inline-flex items-center gap-1 ${config.bg} ${config.text} ${config.border} border ${sizeClasses[size]} ${className}`}>
      <Icon size={iconSizes[size]} strokeWidth={2.5} />
      <span>{text || config.defaultText}</span>
    </div>
  );
};

export default StatusBadge;
