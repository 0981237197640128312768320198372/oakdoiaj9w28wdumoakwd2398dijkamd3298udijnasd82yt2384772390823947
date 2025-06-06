/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { dokmaiCoinSymbol, cn } from '@/lib/utils';
import type { ThemeType, SuccessData } from '@/types';
import DepositQRCode from './DepositQRCode';
import DepositSuccess from './DepositSuccess';
import DepositError from './DepositError';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useThemeUtils } from '@/lib/theme-utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DepositFormProps {
  theme: ThemeType | null;
  onBalanceUpdate?: () => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositForm({
  theme = null,
  onBalanceUpdate,
  isOpen,
  onClose,
}: DepositFormProps) {
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState<boolean>(false);
  const { buyer } = useBuyerAuth();

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
            const currentBalance =
              typeof buyer?.balance === 'object' && buyer?.balance
                ? buyer.balance.amount
                : typeof buyer?.balance === 'number'
                ? buyer.balance
                : 0;

            const depositAmount = parseFloat(amount);
            const bonusAmount = 0;
            const totalDepositAmount = depositAmount + bonusAmount;

            setSuccessData({
              message: 'Deposit successful!',
              name: buyer?.name || 'User',
              paymentId: paymentIntentId,
              depositAmount: depositAmount,
              bonusAmount: bonusAmount,
              totalDepositAmount: totalDepositAmount,
              newBalance: currentBalance + totalDepositAmount,
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

  const amountOptions = [30, 60, 100, 250, 500];

  const handleSelectAmount = (value: number) => {
    setAmount(value.toString());
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'w-full max-w-md p-6 rounded-lg shadow-xl',
            themeUtils.getCardClass(),
            themeUtils.getComponentRoundednessClass(),
            themeUtils.getComponentShadowClass()
          )}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={cn('text-xl font-semibold')}>Deposit Dokmai Coin</h2>
            <button
              onClick={onClose}
              className={cn(
                'p-1 rounded-full transition-colors',
                isLight ? 'hover:bg-dark-100' : 'hover:bg-dark-800'
              )}>
              <X size={18} className={cn('opacity-60')} />
            </button>
          </div>

          <p className={cn('text-center mb-6 opacity-60')}>1 Dokmai Coin = 1 Baht</p>

          {error && !showError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md text-red-400 text-sm">
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
            <div>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center">
                  <Image
                    src={dokmaiCoinSymbol(isLight)}
                    alt="Dokmai Coin"
                    className="h-8 w-auto mr-2"
                    width={50}
                    height={50}
                  />
                  <span className="text-5xl font-bold">{amount || '500'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {amountOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectAmount(option)}
                    className={cn(
                      'py-2 px-4 flex justify-center items-center transition-colors',
                      themeUtils.getButtonRoundednessClass(),
                      themeUtils.getButtonBorderClass(),
                      themeUtils.getButtonShadowClass(),
                      amount === option.toString()
                        ? themeUtils.getButtonClass()
                        : isLight
                        ? 'bg-light-100 border-light-200 hover:border-light-300 hover:bg-light-200'
                        : 'bg-dark-600 border-dark-400 hover:border-dark-300 hover:bg-dark-500'
                    )}>
                    {option}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className={cn(
                    'py-2 px-4 flex justify-center items-center transition-colors',
                    themeUtils.getButtonRoundednessClass(),
                    themeUtils.getButtonBorderClass(),
                    themeUtils.getButtonShadowClass(),
                    !amountOptions.includes(Number(amount)) && amount !== ''
                      ? themeUtils.getButtonClass()
                      : isLight
                      ? 'bg-light-100 border-light-200 hover:border-light-300 hover:bg-light-200'
                      : 'bg-dark-600 border-dark-400 hover:border-dark-300 hover:bg-dark-500'
                  )}>
                  พิมพ์เอง
                </button>
              </div>

              {(!amountOptions.includes(Number(amount)) || amount === '') && (
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="10"
                      step="1"
                      className={cn(
                        'w-full rounded-lg py-3 px-4 focus:outline-none focus:ring-2',
                        isLight
                          ? 'bg-white border border-dark-300 text-dark-800 placeholder-dark-500 focus:ring-dark-400'
                          : 'bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:ring-white'
                      )}
                      placeholder="Enter amount"
                    />
                  </div>
                  <p className={cn('mt-1 text-xs opacity-60')}>Minimum deposit: 10 Dokmai Coin</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-lg border transition-colors opacity-60 hover:',
                    themeUtils.getButtonRoundednessClass(),
                    isLight
                      ? 'bg-light-100 border-light-200 hover:border-light-300 hover:bg-light-200'
                      : 'bg-dark-600 border-dark-400 hover:border-dark-300 hover:bg-dark-500'
                  )}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || !amount || parseFloat(amount) < 10}
                  className={cn(
                    'flex-1 py-3 justify-center px-4 rounded-lg transition-colors',
                    themeUtils.getButtonClass() + ' ' + themeUtils.getPrimaryColorClass('border'),
                    isLoading ||
                      !amount ||
                      (parseFloat(amount) < 10 && ' opacity-30 cursor-not-allowed')
                  )}>
                  {isLoading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
                </button>
              </div>
            </div>
          )}

          {showSuccess && successData && (
            <DepositSuccess data={successData} onClose={handleCloseSuccess} theme={theme} />
          )}

          {showError && error && <DepositError message={error} onClose={handleCloseError} />}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
