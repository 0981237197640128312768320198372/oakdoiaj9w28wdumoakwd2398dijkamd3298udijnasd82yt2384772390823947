/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { useThemeUtils } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';
import type { ThemeType, SuccessData } from '@/types';
import DepositQRCode from './DepositQRCode';
import DepositSuccess from './DepositSuccess';
import DepositError from './DepositError';

interface DepositFormProps {
  theme: ThemeType | null;
  onBalanceUpdate?: () => Promise<void>;
}

export default function DepositForm({ theme = null, onBalanceUpdate }: DepositFormProps) {
  const themeUtils = useThemeUtils(theme);
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState<boolean>(false);
  const { buyer } = useBuyerAuth();

  // State variables for QR code flow
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  const [timer] = useState<number>(900);

  useEffect(() => {
    if (!paymentIntentId) return;

    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(
        `/api/v3/webhooks/payment-events?paymentIntentId=${paymentIntentId}`
      );

      eventSource.addEventListener('payment_update', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE payment update:', data);
          setPaymentStatus(data.status);

          if (data.status === 'succeeded') {
            setSuccessData({
              message: 'Deposit successful!',
              name: buyer?.name || 'User',
              paymentId: paymentIntentId,
              depositAmount: parseFloat(amount),
              bonusAmount: 0,
              totalDepositAmount: parseFloat(amount),
              newBalance:
                (typeof buyer?.balance === 'object' && buyer?.balance
                  ? buyer.balance.amount
                  : typeof buyer?.balance === 'number'
                  ? buyer.balance
                  : 0) + parseFloat(amount),
            });
            setShowSuccess(true);

            if (onBalanceUpdate) {
              onBalanceUpdate();
            }

            if (eventSource) {
              eventSource.close();
            }
          } else if (data.status === 'canceled' || data.status === 'failed') {
            setError(`Payment ${data.status}. Please try again.`);
            setShowError(true);
            setShowQRCode(false);

            if (eventSource) {
              eventSource.close();
            }
          }
        } catch (err) {
          console.error('Error parsing payment update:', err);
        }
      });

      eventSource.onopen = () => {
        console.log('SSE connection opened');
      };
    } catch (error) {
      console.error('Error setting up payment status monitoring:', error);
    }
  }, [paymentIntentId, amount, buyer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue < 10) {
        throw new Error('Minimum deposit amount is 10 THB');
      }

      const response = await fetch('/api/v3/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('buyerToken')}`,
        },
        body: JSON.stringify({
          amount: amountValue,
          email: `${buyer?.username}@dokmaistore.com` || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      setQrCodeData(data.qrCodeData);
      setPaymentIntentId(data.paymentIntentId);
      setPaymentStatus('pending');
      setShowQRCode(true);
      setIsLoading(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
      setIsLoading(false);
    }
  };

  const handleQRCodeExpire = () => {
    setError('QR code has expired. Please try again.');
    setShowError(true);
    setShowQRCode(false);

    if (paymentIntentId) {
      fetch('/api/payments/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId }),
      }).catch((err) => console.error('Error canceling payment:', err));
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setQrCodeData('');
    setPaymentIntentId('');
    setPaymentStatus('');
    setShowQRCode(false);
    setAmount('');

    // No need to call onBalanceUpdate here as it's already called when payment succeeds
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  if (!buyer) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Please log in to make a deposit</p>
      </div>
    );
  }

  return (
    <div className={cn('p-6 rounded-lg shadow-md', themeUtils.getCardClass())}>
      <h2 className="text-2xl font-semibold mb-4">Deposit Dokmai Coins</h2>
      <p className="mb-4 text-gray-600">
        Add funds to your wallet to purchase products. 1 Dokmai Coin = 1 THB.
      </p>

      {error && !showError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}
      {showQRCode && qrCodeData ? (
        <DepositQRCode
          qrCodeData={qrCodeData}
          amount={parseFloat(amount)}
          timer={timer}
          status={paymentStatus}
          onExpire={handleQRCodeExpire}
          theme={theme}
          paymentIntentId={paymentIntentId}
        />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (THB)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                ฿
              </span>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="10"
                step="1"
                className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter amount"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">Minimum deposit: ฿10</p>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm">
              <span className="text-gray-600">Current balance: </span>
              <span className="font-semibold">
                ฿
                {typeof buyer.balance === 'object' && buyer.balance
                  ? buyer.balance.amount
                  : typeof buyer.balance === 'number'
                  ? buyer.balance
                  : 0}
              </span>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'px-4 py-2 rounded-md text-white',
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : cn(themeUtils.getButtonClass(), 'hover:opacity-90')
              )}>
              {isLoading ? 'Processing...' : 'Deposit Now'}
            </button>
          </div>
        </form>
      )}

      {showSuccess && successData && (
        <DepositSuccess data={successData} onClose={handleCloseSuccess} theme={theme} />
      )}

      {showError && error && <DepositError message={error} onClose={handleCloseError} />}
    </div>
  );
}
