/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Image from 'next/image';
import { QRCode } from 'react-qrcode-logo';
import kbank from '@/assets/icons/kbank.svg';
import scb from '@/assets/icons/scb.svg';
import bbl from '@/assets/icons/bbl.svg';
import bay from '@/assets/icons/bay.svg';
import gsb from '@/assets/icons/gsb.svg';
import ktb from '@/assets/icons/ktb.svg';

import kbankblack from '@/assets/icons/kbankblack.svg';
import scbblack from '@/assets/icons/scbblack.svg';
import bblblack from '@/assets/icons/bblblack.svg';
import bayblack from '@/assets/icons/bayblack.svg';
import gsbblack from '@/assets/icons/gsbblack.svg';
import ktbblack from '@/assets/icons/ktbblack.svg';

import promptpay from '@/assets/icons/promptpay.svg';
import promptpayblack from '@/assets/icons/promptpayblack.svg';

import { FaStripe, FaLock, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import { ThemeType } from '@/types';
import { useThemeUtils } from '@/lib/theme-utils';
import { cn, dokmaiCoinSymbol } from '@/lib/utils';

interface PromptPayQRProps {
  amount: number;
  qrCodeData: string;
  theme: ThemeType | null;
}

export default function PromptPayQR({ amount, qrCodeData, theme }: PromptPayQRProps) {
  const thaibanksWhite = [kbank, scb, bbl, bay, gsb, ktb];
  const thaibanksBlack = [kbankblack, scbblack, bblblack, bayblack, gsbblack, ktbblack];
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';
  const thaibanks = isLight ? thaibanksBlack : thaibanksWhite;
  const promptpaylogo = isLight ? promptpayblack : promptpay;

  return (
    <div
      className={cn(
        'p-5 w-full max-w-lg mx-auto flex flex-col justify-center items-center select-none',
        themeUtils.getComponentRoundednessClass()
      )}>
      <div
        className={cn(
          'flex w-full items-center justify-center mb-1 py-2 px-3',
          themeUtils.getPrimaryColorClass('text')
        )}>
        <FaShieldAlt className="mr-2" />
        <span className="flex items-center text-xs font-medium ">
          ระบบใช้{' '}
          <Link
            href="https://stripe.com"
            className="mx-1 hover:opacity-80 transition-colors duration-200 flex items-center">
            <FaStripe className="mx-1 text-4xl" />
          </Link>{' '}
          <FaLock className="mx-1" /> รักษาความปลอดภัยธุรกรรม
        </span>
      </div>

      <div
        className={cn(
          'flex flex-col justify-center items-center p-2 border w-full ',
          themeUtils.getCardClass(),
          themeUtils.getComponentRoundednessClass(),
          themeUtils.getPrimaryColorClass('border')
        )}>
        <div className="flex items-center justify-center w-full gap-5">
          <Image src={promptpaylogo} alt="PromptPay" className="w-auto h-7" draggable={false} />
          <div className={cn('h-9 w-[0.7px]', isLight ? 'bg-dark-800/70' : 'bg-light-100/70')} />
          <FaStripe className="text-6xl text-[#635BFF]" />
        </div>

        <div
          className={cn(
            'p-2',
            isLight ? 'bg-dark-800' : 'bg-white',
            themeUtils.getComponentRoundednessClass()
          )}>
          <QRCode
            value={qrCodeData}
            size={250}
            bgColor={isLight ? '#0f0f0f' : '#fff'}
            fgColor={isLight ? '#fff' : '#0f0f0f'}
            logoImage="/icons/favicon-admin.png"
            logoWidth={45}
            logoHeight={45}
            logoPadding={3}
            logoPaddingStyle="square"
            id="Dokmai Store PromptPay"
            quietZone={10}
          />
        </div>

        {/* Amount Display */}
        <div className="w-full flex flex-col justify-center items-center">
          <p className="text-sm uppercase tracking-wider my-1">จำนวนเงิน</p>
          <div
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 w-full',
              themeUtils.getPrimaryColorClass('bg') + '/15',
              themeUtils.getComponentRoundednessClass()
            )}>
            <Image
              src={dokmaiCoinSymbol(isLight)}
              alt="Dokmai Coin"
              className="w-auto h-6"
              draggable={false}
            />
            <p className="font-bold text-2xl tracking-widest select-none">
              {amount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Supported Banks */}
      <div className="w-full mt-5 mb-2">
        <p className="text-xs text-center mb-3">ธนาคารที่รองรับ</p>
        <div className="flex justify-center flex-wrap gap-3">
          {thaibanks.map((bank, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="border rounded-full p-[1px]">
                <Image
                  src={bank}
                  alt="Bank"
                  className="h-auto w-10 lg:w-12 fill-black rounded-full p-2 transition-transform hover:scale-105"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <p className="text-xs text-gray-500 font-light text-center mt-4 max-w-sm">
        PromptPay ได้รับการสนับสนุนจากแอปธนาคารและแอปชำระเงินอื่นๆ เช่น TTB, ธนาคารออมสิน (GSB),
        ธนาคารเกียรตินาคิน, UOB
      </p>
    </div>
  );
}
