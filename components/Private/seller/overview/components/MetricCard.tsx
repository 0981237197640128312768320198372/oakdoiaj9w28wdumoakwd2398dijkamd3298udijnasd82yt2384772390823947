'use client';

import { LucideIcon, Loader2 } from 'lucide-react';
import { dokmaiCoinSymbol } from '@/lib/utils';
import Image from 'next/image';

interface MetricCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  format: string;
  loading?: boolean;
}

export function MetricCard({ label, value, icon: Icon, color, format, loading }: MetricCardProps) {
  const dokmaiCoin = dokmaiCoinSymbol(false);

  const formatValue = (val: number, fmt: string) => {
    if (loading) return '...';

    switch (fmt) {
      case 'currency':
        return val.toLocaleString();
      case 'rating':
        return val.toFixed(1);
      case 'number':
      default:
        return val.toLocaleString();
    }
  };

  return (
    <div className="bg-dark-700 border border-dark-600 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-6 h-6 ${color}`} />
        {loading && <Loader2 className="w-3 h-3 animate-spin text-light-400" />}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1">
          {format === 'currency' && (
            <Image src={dokmaiCoin} alt="Dokmai Coin" width={11} height={11} className="w-3 h-3" />
          )}
          <span className="text-sm font-medium text-white">{formatValue(value, format)}</span>
          {format === 'rating' && <span className="text-xs text-light-400">/5</span>}
        </div>
        <p className="text-xs text-light-400">{label}</p>
      </div>
    </div>
  );
}
