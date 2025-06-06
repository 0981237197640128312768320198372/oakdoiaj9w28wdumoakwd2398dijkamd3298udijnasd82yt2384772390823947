/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface DepositTimerProps {
  seconds: number;
  onExpire: () => void;
  theme?: ThemeType | null;
}

const DepositTimer: React.FC<DepositTimerProps> = ({ seconds, onExpire, theme = null }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const percentage = (timeLeft / seconds) * 100;
  const themeUtils = useThemeUtils(theme);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire, seconds]);

  // Format time as mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const remainingSeconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;

  // Determine color based on time left
  const getColor = () => {
    if (percentage > 80) return 'bg-green-500';
    if (percentage > 50) return 'bg-yellow-500';
    if (percentage > 20) return 'bg-orange-500';
    if (percentage > 10) return 'bg-rose-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full mt-4 mb-2">
      <div className="flex justify-between mb-1 text-sm">
        <span className="text-gray-500">Time remaining</span>
        <span
          className={cn(
            percentage <= 20 ? 'text-red-500 font-bold animate-bounce' : 'font-medium',
            percentage <= 50 ? 'animate-pulse' : ''
          )}>
          {formattedTime}
        </span>
      </div>
      <div className={cn(`w-full h-2 ${getColor()}/20 rounded-full overflow-hidden`)}>
        <div
          className={cn(
            `h-full ${getColor()} transition-all duration-1000 ease-linear rounded-full`
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        QR Code will expire when the timer ends. Please complete payment before it expires.
      </p>
    </div>
  );
};

export default DepositTimer;
