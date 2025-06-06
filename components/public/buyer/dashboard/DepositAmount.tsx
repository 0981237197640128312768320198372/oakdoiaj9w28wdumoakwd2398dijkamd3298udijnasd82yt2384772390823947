'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface DepositAmountProps {
  amount: number;
  loading: boolean;
  handleAmountChange: (value: number) => void;
  handleSubmit: (e: React.FormEvent) => void;
  theme?: ThemeType | null;
}

const DepositAmount: React.FC<DepositAmountProps> = ({
  amount,
  loading,
  handleAmountChange,
  handleSubmit,
  theme = null,
}) => {
  const themeUtils = useThemeUtils(theme);

  return (
    <div
      className={cn(
        'w-full max-w-md mx-auto rounded-lg p-6 transition-all duration-300 shadow-lg',
        themeUtils.getCardClass()
      )}>
      <h2
        className={cn(
          'text-2xl font-bold mb-6 text-center',
          themeUtils.getPrimaryColorClass('text')
        )}>
        Deposit Dokmai Coins
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <label htmlFor="amount" className="block text-sm font-medium mb-2 text-gray-500">
            Amount to deposit
          </label>
          <div
            className={cn(
              'flex items-center rounded-lg overflow-hidden border focus-within:ring-2 focus-within:ring-opacity-50 transition-all duration-200',
              themeUtils.getPrimaryColorClass('border'),
              `focus-within:ring-${themeUtils.getPrimaryColorClass('text').split('-')[1]}`
            )}>
            <div
              className={cn(
                'p-3 flex items-center justify-center',
                themeUtils.getPrimaryColorClass('bg'),
                'bg-opacity-10'
              )}>
              <Image
                src="/icons/favicon.png"
                alt="Dokmai Coin"
                width={24}
                height={24}
                className="w-auto h-6"
              />
            </div>
            <input
              id="amount"
              type="number"
              value={amount || ''}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              placeholder="Minimum 10 Dokmai Coins"
              min={10}
              className="flex-1 h-12 border-0 focus:ring-0 bg-transparent text-base"
            />
            <div
              className={cn(
                'px-3 font-medium whitespace-nowrap',
                themeUtils.getPrimaryColorClass('bg'),
                'bg-opacity-10',
                themeUtils.getPrimaryColorClass('text')
              )}>
              Coins
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Minimum deposit amount: 10 Dokmai Coins</p>
        </div>

        {amount >= 10 && (
          <div
            className={cn(
              'border rounded-lg p-3 text-sm animate-fadeIn',
              themeUtils.getPrimaryColorClass('bg'),
              'bg-opacity-5',
              themeUtils.getPrimaryColorClass('border'),
              'border-opacity-10'
            )}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-500">Deposit amount:</span>
              <span className={cn('font-medium', themeUtils.getPrimaryColorClass('text'))}>
                {amount} Dokmai Coins
              </span>
            </div>
            {/* Add bonus calculation if needed */}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || amount < 10}
          className={cn(
            'w-full h-12 font-bold rounded-lg transition-all duration-200 flex items-center justify-center',
            loading || amount < 10
              ? 'bg-gray-400 cursor-not-allowed'
              : cn(themeUtils.getButtonClass(), 'hover:opacity-90 active:opacity-80')
          )}>
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-dark-800"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Deposit Now'
          )}
        </button>
      </form>
    </div>
  );
};

export default DepositAmount;
