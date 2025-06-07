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

import { FaStripe, FaLock, FaShieldAlt, FaDownload } from 'react-icons/fa';
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

  const downloadQRCode = () => {
    const canvas = document.querySelector('#qr-code-canvas canvas') as HTMLCanvasElement;
    if (canvas) {
      // Create a new canvas with white background for better visibility
      const newCanvas = document.createElement('canvas');
      const ctx = newCanvas.getContext('2d');

      if (ctx) {
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;

        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

        // Draw the QR code on top
        ctx.drawImage(canvas, 0, 0);

        // Convert to blob and download
        newCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `promptpay-qr-${amount}-baht.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      }
    }
  };

  return (
    <div
      id="qr-code-canvas"
      className={cn(
        'p-5 w-full flex flex-col justify-center items-center select-none',
        themeUtils.getComponentRoundednessClass()
      )}>
      <div
        className={cn(
          'hidden w-full items-center justify-center mb-1 text-xs md:flex',
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
            size={200}
            bgColor={isLight ? '#0f0f0f' : '#fff'}
            fgColor={isLight ? '#fff' : '#0f0f0f'}
            logoImage="/icons/favicon-admin.png"
            logoWidth={35}
            logoHeight={35}
            logoPadding={3}
            logoPaddingStyle="square"
            id="Dokmai Store PromptPay"
            quietZone={1}
          />
        </div>

        <button
          onClick={downloadQRCode}
          className={cn(
            'mt-3 flex text-xs items-center justify-center gap-2 px-4 py-2  font-medium transition-all duration-200 hover:scale-105',
            themeUtils.getPrimaryColorClass('bg'),
            themeUtils.getPrimaryColorClass('text') === 'text-white' ? 'text-white' : 'text-black',
            themeUtils.getComponentRoundednessClass()
          )}>
          <FaDownload className="w-4 h-4" />
          ดาวน์โหลด QR Code
        </button>

        <div className="w-full flex flex-col justify-center items-center">
          <div
            className={cn(
              'flex items-center justify-center gap-2 px-4 mt-3 py-2 w-full',
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

      <div className="w-full mt-5 mb-2 ">
        <p className="text-xs text-center mb-3">ธนาคารที่รองรับ</p>
        <div className="flex justify-center flex-wrap gap-3">
          {thaibanks.map((bank, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="border rounded-full p-[1px]">
                <Image
                  src={bank}
                  alt="Bank"
                  className="h-auto w-6 lg:w-7 xl:w-10 fill-black rounded-full p-1 transition-transform hover:scale-105"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 font-light text-center mt-4 w-full max-w-lg mx-auto">
        PromptPay ได้รับการสนับสนุนจากแอปธนาคารและแอปชำระเงินอื่นๆ เช่น TTB, ธนาคารออมสิน (GSB),
        ธนาคารเกียรตินาคิน, UOB
      </p>
    </div>
  );
}
