/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import Image from 'next/image';
import { QRCode } from 'react-qrcode-logo';
import kbank from '@/assets/images/kbank.svg';
import ktb from '@/assets/images/ktb.svg';
import scb from '@/assets/images/scb.svg';
import gsb from '@/assets/images/gsb.svg';
import bbl from '@/assets/images/bbl.svg';
import bay from '@/assets/images/bay.svg';
import promptpay from '@/assets/images/promptpay.webp';
import { FaStripe } from 'react-icons/fa';
import dokmaicoin3d from '@/assets/images/dokmaicoin3d.png';

export default function PromptPayQR() {
  const thaibanks = [kbank, scb, bbl, bay, gsb, ktb];
  const divRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (filename: string) => {
    if (divRef.current) {
      const canvas = await html2canvas(divRef.current);
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, filename);
        }
      });
    }
  };
  return (
    <div className="max-w-md mx-auto rounded-lg shadow-md">
      <div ref={divRef} className="p-5 flex flex-col justify-center items-center">
        <div className="bg-dark-700 p-5 border-[0.5px] border-primary flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center gap-5 p-5 w-fit rounded-xl bg-dark-600 border-[0.5px] border-dark-100">
            <div className="h-8 w-full gap-5 flex flex-row-reverse items-center justify-center">
              <FaStripe className="text-6xl" />
              <div className="h-full w-[0.3px] bg-white" />
              <Image
                src={promptpay}
                alt="Prompt Pay Logo | dokmaistore.com"
                className="w-auto h-6 "
              />
            </div>
            <QRCode
              value="00020101021230540016A0000006770101120115010556207402702021125062781065520412345303764540510.005802TH5902NA6304CE42"
              size={200}
              bgColor="#fff"
              fgColor="#000"
              logoImage="/icons/favicon.png"
              logoWidth={35}
              logoHeight={35}
              logoPadding={3}
              logoPaddingStyle="square"
              id="Dokmai Store Prompt Pay"
            />
            <div className="w-full flex flex-col justify-center items-center">
              <p className="text-light-600 font-light text-xs">Dokmai Coin</p>
              <div className="py-2 gap-2 text-lg flex flex-row justify-center items-center bg-gradient-to-br from-transparent via-dark-500/30 to-transparent w-full">
                <Image
                  src={dokmaicoin3d}
                  alt="Dokmai Coin Logo | dokmaistore.com"
                  className="w-auto h-10"
                />
                <p className="font-bold text-xl text-light-200 tracking-widest">1000</p>
              </div>
            </div>
          </div>
          <div className="flex justify-evenly mt-5 gap-3 h-fit">
            {thaibanks.map((bank, i) => (
              <Image
                src={bank}
                key={i}
                alt=""
                className="w-10 h-10 bg-dark-500 border-[0.5px] border-light-800/30 rounded-full p-2"
              />
            ))}
          </div>
          <p className="text-xs text-light-500 font-light text-center mt-5">
            PromptPay ได้รับการสนับสนุนจากแอปธนาคารและแอปชำระเงินอื่นๆ เช่น TTB, ธนาคารออมสิน (GSB),
            ธนาคารเกียรตินาคิน, UOB
          </p>
        </div>
      </div>

      <button
        onClick={() => handleDownload('PromptPayQR')}
        className="mt-5 px-4 py-2 bg-primary text-black rounded-md">
        Download QR
      </button>
    </div>
  );
}
