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

export default function QRGenerator() {
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
      <div ref={divRef} className="p-5">
        <div className="bg-dark-700 p-10 border-[0.5px] border-primary/80 rounded-xl flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center p-5 w-fit rounded-xl bg-[#003d6b] ">
            <div className="h-8 w-full mb-3 gap-3 flex flex-row-reverse items-center justify-center">
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
              bgColor="#ffffff"
              fgColor="#0F0F0F"
              logoImage="/icons/dokmaicoin3d.png"
              logoWidth={35}
              logoHeight={35}
              logoPadding={0.5}
              logoPaddingStyle="circle"
              id="Dokmai Store Prompt Pay"
            />
          </div>
          <p className="text-xs text-light-500 font-light text-center mt-3">
            PromptPay is supported by bank apps and payment apps such as KBank, SCB, Bangkok Bank,
            Krunthai Bank and Krungsri
          </p>
          <div className="flex justify-evenly mt-3 gap-3">
            {thaibanks.map((bank, i) => (
              <Image
                src={bank}
                key={i}
                alt=""
                className="w-10 h-10 bg-dark-500 border-[0.5px] border-light-800/30 rounded-full p-2"
              />
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => handleDownload('PromptPayQR')}
        className="mt-4 px-4 py-2 bg-primary text-black rounded-md">
        Download QR
      </button>
    </div>
  );
}
