/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { dokmaiCoinSymbol, cn } from '@/lib/utils';
import type { ThemeType, SuccessData } from '@/types';
import DepositQRCode from './DepositQRCode';
import DepositSuccess from './DepositSuccess';
import DepositError from './DepositError';
import { downloadQRCode } from './PromptPayQR';
import { FaDownload } from 'react-icons/fa';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useThemeUtils } from '@/lib/theme-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { notifyLineMessage, OWNER_ID } from '@/lib/services/lineService';

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

  const [timer] = useState<number>(90);
  const now = new Date();
  const currentTime = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  useEffect(() => {
    if (!paymentIntentId) return;

    let eventSource: EventSource | null = null;
    let isProcessingPayment = false;
    let connectionTimeout: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
    };

    try {
      eventSource = new EventSource(
        `/api/v3/webhooks/payment-events?paymentIntentId=${paymentIntentId}`
      );

      // Set connection timeout (30 seconds)
      connectionTimeout = setTimeout(() => {
        console.warn('EventSource connection timeout');
        cleanup();
        setError('Connection timeout. Please check your payment status manually.');
        setShowError(true);
      }, 30000);

      eventSource.addEventListener('payment_update', async (event) => {
        // Prevent concurrent processing
        if (isProcessingPayment) {
          console.log('Payment already being processed, skipping...');
          return;
        }

        try {
          const data = JSON.parse(event.data);
          setPaymentStatus(data.status);

          if (data.status === 'succeeded') {
            isProcessingPayment = true;

            const depositAmount = parseFloat(amount);
            const bonusAmount = 0;
            const totalDepositAmount = depositAmount + bonusAmount;

            let updatedBalance = 0;
            try {
              const balanceUpdateResponse = await fetch('/api/v3/balance/update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('buyerToken')}`,
                },
                body: JSON.stringify({
                  paymentIntentId: paymentIntentId,
                  amount: totalDepositAmount,
                }),
              });

              if (balanceUpdateResponse.ok) {
                const balanceUpdateData = await balanceUpdateResponse.json();
                updatedBalance = balanceUpdateData.balance || 0;
              } else {
                const errorData = await balanceUpdateResponse.json();
                throw new Error(errorData.error || 'Failed to update balance');
              }
            } catch (error) {
              console.error('Error updating balance:', error);

              // Only use fallback if it's not a critical security error
              if (
                error instanceof Error &&
                !error.message.includes('Payment verification failed') &&
                !error.message.includes('already been processed')
              ) {
                try {
                  const balanceResponse = await fetch('/api/v3/buyer/details', {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('buyerToken')}`,
                    },
                  });
                  if (balanceResponse.ok) {
                    const balanceData = await balanceResponse.json();
                    updatedBalance = balanceData.buyer?.balance?.amount || 0;
                  }
                } catch (fallbackError) {
                  console.error('Error fetching updated balance:', fallbackError);
                  // Don't calculate balance manually - let user refresh
                  setError('Payment processed but balance update failed. Please refresh the page.');
                  setShowError(true);
                  cleanup();
                  return;
                }
              } else {
                // Critical error - don't proceed
                setError(error instanceof Error ? error.message : 'Payment processing failed');
                setShowError(true);
                cleanup();
                return;
              }
            }

            const messageNotif = `🚨💸 Deposit successful 💸🚨 \n\n⌛ ${currentTime}\n\n🪪 ${
              buyer?.name
            }\n(${
              buyer?.username || buyer?.personalKey
            })\n\nPayment ID: ${paymentIntentId}\n\nDeposit: ${depositAmount} Dokmai Coins\nBonus: ${bonusAmount} Dokmai Coins\nTotal: ${totalDepositAmount} Dokmai Coins\n____________\n\nNew Balance: ${updatedBalance} Dokmai Coins`;

            try {
              await notifyLineMessage(OWNER_ID, messageNotif);
            } catch (notifError) {
              console.error('Error sending notification:', notifError);
              // Don't fail the whole process for notification errors
            }

            const success: SuccessData = {
              message: 'Deposit successful!',
              name: buyer?.name || 'User',
              paymentId: paymentIntentId.substring(0, 8),
              depositAmount: depositAmount,
              bonusAmount: bonusAmount,
              totalDepositAmount: totalDepositAmount,
              newBalance: updatedBalance,
            };

            setSuccessData(success);
            setShowSuccess(true);

            if (onBalanceUpdate) {
              try {
                await onBalanceUpdate();
              } catch (updateError) {
                console.error('Error in balance update callback:', updateError);
              }
            }

            cleanup();
          } else if (data.status === 'canceled' || data.status === 'failed') {
            setError(`Payment ${data.status}. Please try again.`);
            setShowError(true);
            setShowQRCode(false);
            cleanup();
          }
        } catch (err) {
          console.error('Error parsing payment update:', err);
          setError('Error processing payment update. Please check your payment status.');
          setShowError(true);
        }
      });

      eventSource.addEventListener('error', (error) => {
        console.error('EventSource error:', error);
        cleanup();
        setError('Connection error. Please check your payment status manually.');
        setShowError(true);
      });

      eventSource.onopen = () => {
        console.log('EventSource connection opened');
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }
      };
    } catch (error) {
      console.error('Error setting up payment status monitoring:', error);
      cleanup();
      setError('Failed to monitor payment status. Please check manually.');
      setShowError(true);
    }

    // Cleanup function for useEffect
    return cleanup;
  }, [paymentIntentId, amount, buyer, onBalanceUpdate]);

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

  const handleQRCodeExpire = async () => {
    setError('QR code has expired.');
    setShowError(true);
    setShowQRCode(false);

    if (paymentIntentId) {
      try {
        await fetch('/api/v3/payments/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('buyerToken')}`,
          },
          body: JSON.stringify({ paymentIntentId }),
        });

        await fetch('/api/v3/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('buyerToken')}`,
          },
          body: JSON.stringify({
            type: 'deposit',
            category: 'financial',
            status: 'cancelled',
            metadata: {
              amount: parseFloat(amount),
              paymentMethod: 'promptpay',
              paymentId: paymentIntentId,
              reason: 'QR code expired',
              description: `Deposit of ${amount} Dokmai Coin was canceled due to QR code expiration`,
            },
          }),
        });
      } catch (err) {
        console.error('Error handling QR code expiration:', err);
      }
    }
  };

  const handleCancelTransaction = async () => {
    if (!paymentIntentId) return;

    try {
      const response = await fetch('/api/v3/payments/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('buyerToken')}`,
        },
        body: JSON.stringify({
          paymentIntentId,
          reason: 'user_canceled',
        }),
      });

      if (response.ok) {
        await fetch('/api/v3/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('buyerToken')}`,
          },
          body: JSON.stringify({
            type: 'deposit',
            category: 'financial',
            status: 'cancelled',
            metadata: {
              amount: parseFloat(amount),
              paymentMethod: 'promptpay',
              paymentId: paymentIntentId,
              reason: 'user_canceled',
              description: `Deposit of ${amount} Dokmai Coin was canceled by user`,
            },
          }),
        });

        setShowQRCode(false);
        setQrCodeData('');
        setPaymentIntentId('');
        setPaymentStatus('');
        setAmount('');
        onClose();
      }
    } catch (error) {
      console.error('Error canceling transaction:', error);
      setError('Failed to cancel transaction. Please try again.');
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setQrCodeData('');
    setPaymentIntentId('');
    setPaymentStatus('');
    setShowQRCode(false);
    setAmount('');
    onClose(); // Close the main modal as well
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
    <>
      {showError && error && <DepositError message={error} onClose={handleCloseError} />}
      <AnimatePresence>
        {showQRCode && qrCodeData ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}>
            <DepositQRCode
              qrCodeData={qrCodeData}
              amount={parseFloat(amount)}
              timer={timer}
              status={paymentStatus}
              onExpire={handleQRCodeExpire}
              theme={theme}
              paymentIntentId={paymentIntentId}
              onSuccess={onClose}
            />
            <div className="mt-5 flex justify-center mx-auto gap-5 max-w-md items-center ">
              <button
                type="button"
                onClick={handleCancelTransaction}
                className={cn(
                  'px-4 py-2 border w-full transition-colors text-xs bg-red-500/15 border-red-500/40 text-red-500 hover:bg-red-500/25 hover:border-red-500/70',
                  themeUtils.getButtonRoundednessClass()
                )}>
                Cancel Transaction
              </button>{' '}
              <button
                type="button"
                onClick={() => downloadQRCode(parseFloat(amount))}
                className={cn(
                  'flex items-center justify-center w-full gap-2 px-4 py-2 border transition-colors text-xs',
                  themeUtils.getPrimaryColorClass('bg'),
                  themeUtils.getButtonClass(),
                  themeUtils.getButtonRoundednessClass(),
                  themeUtils.getPrimaryColorClass('border')
                )}>
                <FaDownload className="w-3 h-3" />
                Download QR
              </button>
            </div>
          </motion.div>
        ) : (
          <div
            className={cn(
              'fixed inset-0 z-[9999] flex items-center justify-center w-full px-5 lg:px-5 backdrop-blur-xl',
              showQRCode && qrCodeData
                ? 'bg-black/70'
                : isLight
                ? 'bg-light-200/50'
                : 'bg-dark-700/50'
            )}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'w-full max-w-lg p-5 text-xs md:text-base',
                themeUtils.getCardClass(),
                themeUtils.getComponentRoundednessClass(),
                themeUtils.getComponentShadowClass()
              )}>
              {error && !showError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <p className={cn('text-center opacity-60')}>1 Dokmai Coin = 1 Baht</p>
                  <button
                    onClick={onClose}
                    className={cn(
                      'p-2 rounded-full transition-colors',
                      isLight ? 'hover:bg-dark-100' : 'hover:bg-dark-800'
                    )}>
                    <X size={18} className={cn('opacity-60')} />
                  </button>
                </div>

                <div className="text-center select-none">
                  <div className="flex gap-2 items-center justify-center overflow-hidden">
                    <Image
                      src={dokmaiCoinSymbol(isLight)}
                      alt="Dokmai Coin"
                      className="h-8 w-auto"
                      width={50}
                      height={50}
                    />
                    <span className="text-5xl font-bold">{amount || '500'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
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
                    พิมพ์จำนวน
                  </button>
                </div>

                {(!amountOptions.includes(Number(amount)) || amount === '') && (
                  <div className="mb-5 ">
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="10"
                        step="1"
                        className={cn(
                          ' px-5 py-2.5 w-full border rounded-lg text-sm focus:outline-none focus:ring-1',
                          themeUtils.getButtonRoundednessClass(),
                          themeUtils.getButtonShadowClass(),
                          isLight
                            ? 'bg-light-100 border-light-300 text-dark-800 focus:ring-0 focus:bg-light-200'
                            : 'bg-dark-600 border-dark-400 text-light-200 focus:ring-0 focus:bg-dark-500'
                        )}
                        placeholder="Enter amount"
                      />
                    </div>
                    <p className={cn('mt-1 text-xs opacity-60')}>Minimum deposit: 10 Dokmai Coin</p>
                  </div>
                )}

                <div className="flex gap-5 mt-5">
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
                        (parseFloat(amount) < 10 && ' opacity-30 cursor-not-allowed'),
                      isLoading && ' opacity-60 cursor-not-allowed'
                    )}>
                    {isLoading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {showSuccess && successData && (
        <DepositSuccess data={successData} onClose={handleCloseSuccess} theme={theme} />
      )}
    </>
  );
}
