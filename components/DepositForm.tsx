/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { logActivity, updateStatistic } from '@/lib/utils';
import DepositAmount from './DepositAmount';
import DepositQRCode from './DepositQRCode';
import DepositSuccess from './DepositSuccess';
import DepositError from './DepositError';
import DepositSteps from './DepositSteps';
import { DepositFormProps, PaymentStep, DepositState, SuccessData } from '@/types';

const steps: PaymentStep[] = [
  { id: 1, title: 'ระบุจำนวนเงิน', description: 'กรุณาระบุจำนวน Dokmai Coin ที่ต้องการเติม' },
  { id: 2, title: 'ชำระเงิน', description: 'สแกน QR Code เพื่อชำระเงินผ่าน PromptPay' },
  { id: 3, title: 'เสร็จสิ้น', description: 'การเติมเงินเสร็จสมบูรณ์' },
];

const DepositForm: React.FC<DepositFormProps> = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<DepositState>({
    personalKey: '',
    amount: 0,
    qrCodeData: '',
    paymentIntentId: '',
    status: 'pending',
    error: '',
    timer: 60 * 10,
    bonusPercentage: 0,
    loading: false,
  });

  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const authData = localStorage.getItem('personalKey') as string;
      setState((prev) => ({ ...prev, personalKey: authData }));
    } catch (error) {
      console.log('Error fetching personalKey:', error);
    }
  }, []);

  const cleanPersonalKey = state.personalKey?.replace('#', '');

  const handleAmountChange = (value: number) => {
    setState((prev) => ({ ...prev, amount: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: '' }));

    try {
      const email = `${cleanPersonalKey?.toLowerCase()}@dokmaistore.com`;
      const response = await fetch('/api/v2/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: state.amount, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setState((prev) => ({
        ...prev,
        qrCodeData: data.qrCodeData,
        paymentIntentId: data.paymentIntentId,
        timer: 60 * 10,
        loading: false,
      }));

      setCurrentStep(1);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: (err as Error).message,
        loading: false,
      }));
      setErrorMessage((err as Error).message);
    }
  };

  const handleDeposit = async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const bonusPercentageNumber = Number(state.bonusPercentage) || 0;
      const bonusAmount = (state.amount * bonusPercentageNumber) / 100;
      const totalDepositAmount = state.amount + bonusAmount;

      const response = await fetch('/api/deposit_balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalKey: state.personalKey,
          totalDepositAmount: totalDepositAmount,
          depositAmount: state.amount,
        }),
      });

      await updateStatistic('depositAmount', state.amount);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deposit balance');
      }

      const data = await response.json();

      setSuccessData({
        message: data.message,
        personalKey: state.personalKey,
        depositAmount: state.amount,
        bonusAmount: bonusAmount,
        totalDepositAmount: totalDepositAmount,
        newBalance: data.newBalance,
      });

      await logActivity('Deposit', state.personalKey, {
        amount: state.amount,
        newBalance: data.newBalance,
        bonusPercentage: state.bonusPercentage,
      });

      setCurrentStep(2);
      setState((prev) => ({
        ...prev,
        status: 'succeeded',
        loading: false,
        amount: 0,
        bonusPercentage: 0,
      }));
    } catch (error) {
      setErrorMessage((error as Error).message || 'An unexpected error occurred');
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (state.paymentIntentId) {
      setState((prev) => ({ ...prev, status: 'processing' }));

      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/v2/payments?paymentIntentId=${state.paymentIntentId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch payment status');
          }

          const data = await response.json();

          if (data.status === 'succeeded') {
            await handleDeposit();
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [state.paymentIntentId]);

  const handleQrExpired = () => {
    setState((prev) => ({
      ...prev,
      status: 'failed',
      qrCodeData: '',
    }));
    setErrorMessage('QR Code has expired. Please try again.');
    setCurrentStep(0);
  };

  const resetForm = () => {
    setState({
      personalKey: state.personalKey,
      amount: 0,
      qrCodeData: '',
      paymentIntentId: '',
      status: 'pending',
      error: '',
      timer: 60 * 10,
      bonusPercentage: 0,
      loading: false,
    });

    setSuccessData(null);
    setCurrentStep(0);
  };

  const clearError = () => {
    setErrorMessage(null);
  };

  return (
    <div className="max-w-xl mx-auto p-5 pt-32">
      <DepositSteps steps={steps} currentStep={currentStep} />

      {currentStep === 0 && (
        <DepositAmount
          amount={state.amount}
          loading={state.loading}
          handleAmountChange={handleAmountChange}
          handleSubmit={handleSubmit}
        />
      )}

      {currentStep === 1 && state.qrCodeData && (
        <DepositQRCode
          qrCodeData={state.qrCodeData}
          amount={state.amount}
          timer={state.timer}
          status={state.status}
          onExpire={handleQrExpired}
        />
      )}

      {successData && <DepositSuccess data={successData} onClose={resetForm} />}

      {errorMessage && <DepositError message={errorMessage} onClose={clearError} />}
    </div>
  );
};

export default DepositForm;
