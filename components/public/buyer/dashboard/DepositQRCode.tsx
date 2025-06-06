/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useState } from 'react';
import PromptPayQR from './PromptPayQR';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import DepositTimer from './DepositTimer';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType, SuccessData } from '@/types';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import DepositSuccess from './DepositSuccess';

interface DepositQRCodeProps {
  qrCodeData: string;
  amount: number;
  timer: number;
  status: string;
  onExpire: () => void;
  theme: ThemeType | null;
  paymentIntentId?: string;
}

const DepositQRCode: React.FC<DepositQRCodeProps> = ({
  qrCodeData,
  amount,
  timer,
  status,
  onExpire,
  theme,
  paymentIntentId,
}) => {
  const themeUtils = useThemeUtils(theme);
  const { buyer } = useBuyerAuth();
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState<boolean>(false);

  // When payment status changes to succeeded, update the balance
  useEffect(() => {
    if (status === 'succeeded' && !isUpdatingBalance && !showSuccess) {
      updateBalance();
    }
  }, [status]);

  // Function to update the balance
  const updateBalance = async () => {
    if (!paymentIntentId || isUpdatingBalance) return;

    setIsUpdatingBalance(true);

    try {
      const response = await fetch('/api/v3/balance/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('buyerToken')}`,
        },
        body: JSON.stringify({
          paymentIntentId,
          amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update balance');
      }

      await response.json();

      setSuccessData({
        message: 'Deposit successful!',
        name: buyer?.name || 'User',
        paymentId: paymentIntentId.substring(0, 8),
        depositAmount: amount,
        bonusAmount: 0,
        totalDepositAmount: amount,
        newBalance:
          (typeof buyer?.balance === 'object' && buyer?.balance
            ? buyer.balance.amount
            : typeof buyer?.balance === 'number'
            ? buyer.balance
            : 0) + amount,
      });

      setTimeout(() => {
        setShowSuccess(true);
      }, 1500);
    } catch (error) {
      console.error('Error updating balance:', error);
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    window.location.reload();
  };

  if (showSuccess && successData) {
    return <DepositSuccess data={successData} onClose={handleCloseSuccess} theme={theme} />;
  }

  return (
    <div
      className={cn(
        'w-full max-w-lg mx-auto rounded-lg p-5 transition-all duration-300 shadow-lg',
        themeUtils.getCardClass()
      )}>
      <div className="flex flex-col items-center">
        <PromptPayQR qrCodeData={qrCodeData} amount={amount} theme={theme} />

        <DepositTimer seconds={timer} onExpire={onExpire} theme={theme} />

        {status === 'processing' && (
          <div className="w-full mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center">
            <Loader2 className="animate-spin text-blue-500 w-5 h-5 mr-2" />
            <span className="text-blue-500 text-sm">Verifying payment, please wait...</span>
          </div>
        )}

        {status === 'succeeded' && (
          <div className="w-full mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center">
            <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
            <span className="text-green-500 text-sm">
              Payment successful! Adding funds to your account...
            </span>
          </div>
        )}

        {status === 'failed' && (
          <div className="w-full mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
            <AlertCircle className="text-red-500 w-5 h-5 mr-2" />
            <span className="text-red-500 text-sm">
              Payment failed or expired. Please try again.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositQRCode;
