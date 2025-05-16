/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, ReactNode } from 'react';
import PromptPayQR from '@/components/PromptPayQR';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
// import CountdownQR from '@/components/CountdownQR';
import dokmaicoin3d from '@/assets/images/dokmaicoin3d.png';
import Image from 'next/image';
import { logActivity, updateStatistic } from '@/lib/utils';

const DepositForm = () => {
  const [personalKey, setPersonalKey] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [status, setStatus] = useState<string>('pending');
  const [error, setError] = useState<string>('');
  const [timer, setTimer] = useState<number>(60 * 30);
  const [bonusPercentage, setBonusPercentage] = useState<number | string>(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<ReactNode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const authData = localStorage.getItem('personalKey') as string;
      setPersonalKey(authData);
    } catch (error) {
      console.log('Error fetching personalKey:', error);
    }
  }, []);

  const cleanPersonalKey = personalKey?.replace('#', '');

  const handleDeposit = async () => {
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const bonusPercentageNumber = Number(bonusPercentage) || 0;
      const bonusAmount = (amount * bonusPercentageNumber) / 100;
      const totalDepositAmount = amount + bonusAmount;

      console.log(personalKey);
      console.log(totalDepositAmount);
      console.log(amount);
      const response = await fetch('/api/deposit_balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalKey,
          totalDepositAmount: totalDepositAmount,
          depositAmount: amount,
        }),
      });
      await updateStatistic('depositAmount', amount);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deposit balance');
      }

      const data = await response.json();

      setSuccessMessage(
        <>
          <p className="font-aktivGroteskBold text-primary">{data.message}</p>
          <p className="font-aktivGroteskBold text-primary">{personalKey}</p>
          <p className="font-light text-light-500">Deposit: {amount}</p> {/* Use amount */}
          <p className="font-light text-light-500">Bonus: {bonusAmount}</p>
          <p className="font-light text-light-500">Total deposit: {totalDepositAmount}</p>
          <p className="font-light text-light-500">Balance: {data.newBalance}</p>
        </>
      );

      await logActivity('Deposit', personalKey, {
        amount: amount,
        newBalance: data.newBalance,
        bonusPercentage,
      });
      setAmount(0);
      setBonusPercentage(0);
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  successMessage && (
    <div className="fixed inset-0 h-screen w-screen bg-dark-800/80 backdrop-blur top-0 right-0 z-40 flex flex-col justify-center items-center rounded shadow">
      <div className="w-fit p-5 bg-dark-700 border-[1px] border-dark-600 rounded-sm">
        <div className="flex flex-col w-full">
          {successMessage}
          <button
            onClick={() => {
              setSuccessMessage(null);
            }}
            className="self-end bg-red-500 font-aktivGroteskBold hover:bg-red-500/90 active:bg-red-500/80 py-1 px-2 text-dark-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );

  {
    errorMessage && (
      <div className="fixed bg-dark-800 top-20 xl:top-40 right-5 xl:right-10 px-4 py-2 rounded shadow">
        <p className="mt-4 text-red-500 bg-red-500/10 p-2 border border-red-500">{errorMessage}</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const email = `${cleanPersonalKey?.toLowerCase()}@dokmaistore.com`;
      const response = await fetch('/api/v2/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create payment');
      setQrCodeData(data.qrCodeData);
      setPaymentIntentId(data.paymentIntentId);
      setTimer(60 * 30);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentIntentId) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/v2/payments?paymentIntentId=${paymentIntentId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch payment status');
          }
          const data = await response.json();
          if (data.status === 'succeeded') {
            await handleDeposit();
            setStatus('succeeded');
            clearInterval(interval);
            window.location.href = '/app';
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [paymentIntentId]);

  useEffect(() => {
    if (timer > 0 && qrCodeData) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0 && status !== 'succeeded') {
      setStatus('failed');
      setQrCodeData('');
    }
  }, [timer, qrCodeData, status]);

  return (
    <div className="max-w-md mx-auto p-5">
      {!qrCodeData && (
        <>
          <h1 className="text-2xl font-bold mb-4">เติมเงิน Dokmai Coin</h1>
          <form onSubmit={handleSubmit} className="gap-5 flex flex-col">
            <div className="flex gap-2 w-full items-center border border-primary px-2 py-1 focus:border-primary focus:outline-none focus:ring-0 bg-transparent text-sm">
              <Image
                src={dokmaicoin3d}
                alt="Dokmai Coin Logo | dokmaistore.com"
                className="w-auto h-5"
                draggable={false}
              />
              <Input
                type="number"
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Minimum 10 Dokmai Coin"
                min={10}
                className="focus:outline-none focus:ring-0 border-0"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-dark-800 font-aktivGroteskBold px-4 py-2 w-full hover:bg-primary/90 active:bg-primary/80 disabled:bg-primary/50">
              {loading ? 'Loading...' : 'เติมเงิน'}
            </button>
          </form>
        </>
      )}

      {error && <Alert variant="destructive">{error}</Alert>}
      {qrCodeData && status === 'pending' && (
        <div>
          {/* <CountdownQR timer={timer} /> */}
          <PromptPayQR qrCodeData={qrCodeData} amount={amount} />
        </div>
      )}
      {status === 'succeeded' && <Alert>Payment successful! </Alert>}
      {status === 'failed' && <Alert variant="destructive">Payment failed or timed out.</Alert>}
    </div>
  );
};

export default DepositForm;
