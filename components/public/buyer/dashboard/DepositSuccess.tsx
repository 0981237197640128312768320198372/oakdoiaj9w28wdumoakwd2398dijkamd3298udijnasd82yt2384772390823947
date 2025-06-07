'use client';

import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import Image from 'next/image';
import { SuccessData } from '@/types';
import { cn, dokmaiCoinSymbol } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface DepositSuccessProps {
  data: SuccessData;
  onClose: () => void;
  theme?: ThemeType | null;
}

const DepositSuccess: React.FC<DepositSuccessProps> = ({ data, onClose, theme = null }) => {
  const themeUtils = useThemeUtils(theme);

  const isLight = themeUtils.baseTheme === 'light';

  useEffect(() => {
    const createConfetti = () => {
      const confettiCount = 100;
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '50';
      document.body.appendChild(container);

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const size = Math.random() * 10 + 5;

        confetti.style.position = 'absolute';
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.borderRadius = '50%';
        confetti.style.top = '0';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.transform = 'translateY(-100%)';
        confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;

        container.appendChild(confetti);

        // Create CSS animation
        const style = document.createElement('style');
        style.innerHTML = `
          @keyframes confettiFall {
            to {
              transform: translateY(100vh) rotate(${Math.random() * 360}deg);
            }
          }
        `;
        document.head.appendChild(style);
      }

      setTimeout(() => {
        document.body.removeChild(container);
      }, 10000);
    };

    createConfetti();
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 h-screen w-screen z-[99999] flex flex-col justify-center items-center backdrop-blur-md',
        isLight
          ? 'bg-gradient-to-br from-light-100/10 to-light-800/10'
          : ' bg-gradient-to-br from-dark-200/10 to-dark-800/10'
      )}>
      <div
        className={cn(
          'relative max-w-md w-full mx-4 rounded-lg p-6 animate-fadeInUp',
          isLight ? 'bg-light-100' : 'bg-dark-700',
          themeUtils.getPrimaryColorClass('border'),
          'border-[1px] border-opacity-70'
        )}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-200 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-5">
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center mb-5',
              themeUtils.getPrimaryColorClass('bg'),
              'bg-opacity-10'
            )}>
            <CheckCircle className={cn('w-10 h-10', themeUtils.getPrimaryColorClass('text'))} />
          </div>
          <h2 className={cn('text-2xl font-bold', themeUtils.getPrimaryColorClass('text'))}>
            Deposit Successful!
          </h2>
        </div>

        <div
          className={cn(
            'rounded-lg p-5 mb-5',
            isLight ? 'bg-light-200 border-light-300' : 'bg-dark-600 border-dark-300'
          )}>
          <div className="flex items-center justify-between mb-3">
            <span className={cn(isLight ? 'text-dark-800' : 'text-light-100')}>Name:</span>
            <span className={cn('font-medium', themeUtils.getPrimaryColorClass('text'))}>
              {data.name}
            </span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className={cn(isLight ? 'text-dark-800' : 'text-light-100')}>Payment ID:</span>
            <span className={cn('font-medium', themeUtils.getPrimaryColorClass('text'))}>
              {data.paymentId}
            </span>
          </div>

          <div
            className={cn(
              'border-t opacity-50 my-3',
              isLight ? 'border-dark-800' : 'border-light-100'
            )}
          />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={cn(isLight ? 'text-dark-800' : 'text-light-100')}>
                Deposit Amount:
              </span>
              <div className="flex items-center gap-1">
                <Image
                  src={dokmaiCoinSymbol(isLight)}
                  alt="Coin"
                  width={16}
                  height={16}
                  className="w-4 h-4 mr-1"
                />
                <span>{data.depositAmount}</span>
              </div>
            </div>

            {data.bonusAmount > 0 && (
              <div className="flex justify-between">
                <span className={cn(isLight ? 'text-dark-800' : 'text-light-100')}>Bonus:</span>
                <div className="flex items-center text-green-500  gap-1">
                  <Image
                    src={dokmaiCoinSymbol(isLight)}
                    alt="Coin"
                    width={16}
                    height={16}
                    className="w-4 h-4 mr-1"
                  />
                  <span>+{data.bonusAmount}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between font-medium">
              <span className={cn(isLight ? 'text-dark-800' : 'text-light-100')}>Total:</span>
              <div
                className={cn('flex items-center  gap-1', themeUtils.getPrimaryColorClass('text'))}>
                <Image
                  src={dokmaiCoinSymbol(isLight)}
                  alt="Coin"
                  width={16}
                  height={16}
                  className="w-4 h-4 mr-1"
                />
                <span>{data.totalDepositAmount}</span>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'border-t opacity-50 my-3',
              isLight ? 'border-dark-800' : 'border-light-100'
            )}
          />

          <div className="flex justify-between font-bold">
            <span className={cn(isLight ? 'text-dark-800' : 'text-light-100')}>New Balance:</span>
            <div
              className={cn('flex items-center  gap-1', themeUtils.getPrimaryColorClass('text'))}>
              <Image
                src={dokmaiCoinSymbol(isLight)}
                alt="Coin"
                width={16}
                height={16}
                className="w-4 h-4 mr-1"
              />
              <span>{data.newBalance}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className={cn(
            'w-full flex justify-center items-center py-3 font-black rounded-lg transition-colors',
            themeUtils.getButtonClass(),
            themeUtils.getButtonRoundednessClass()
          )}>
          Done
        </button>
      </div>
    </div>
  );
};

export default DepositSuccess;
