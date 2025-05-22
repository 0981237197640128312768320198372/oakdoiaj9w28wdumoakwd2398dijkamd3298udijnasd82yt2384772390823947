/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dokmaiwithtext from '@/assets/images/dokmaiwithtext.png';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';

import { FaPowerOff } from 'react-icons/fa';

interface StoreNavbarProps {
  seller: any;
}

export const StoreNavbar: React.FC<StoreNavbarProps> = ({ seller }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed flex flex-col px-5 xl:p-0 items-center justify-center top-0 left-0 w-full transition-transform duration-500 z-50 transform">
      <div className="w-full mt-5 gap-10 bg-dark-700 flex py-1 px-2 lg:p-2 rounded-full max-w-screen-lg justify-between duration-1000 items-center border-[1px] border-dark-500">
        <div className="flex items-center gap-1 w-fit select-none group transition-all duration-500">
          {seller ? (
            <>
              <div className="relative w-10 h-10 overflow-hidden rounded-full border-dark-400 border-[1px]">
                <Image
                  src={seller.store.logoUrl || dokmailogosquare}
                  alt={seller.store.name}
                  layout="fill"
                  objectFit="cover"
                  className="border-[1px] border-dark-600"
                />
              </div>
            </>
          ) : (
            <>
              <Image
                width={100}
                height={100}
                src={dokmaiwithtext}
                loading="lazy"
                alt="Logo of Dokmai Store"
                className="duration-700 hidden max-xl:h-10 max-xl:w-auto xl:block"
              />
              <Image
                width={60}
                height={60}
                src={dokmailogosquare}
                loading="lazy"
                alt="Logo of Dokmai Store"
                className="duration-700 max-xl:h-10 max-xl:w-auto xl:hidden"
              />
            </>
          )}
          {seller && (
            <h1 className="font-aktivGroteskBold text-xs px-2 py-1 group-hover:border-dark-300 border-dark-700 border-[1px] rounded-full group-hover:bg-dark-700 tracking-widest text-light-500 transition-all duration-500 xl:hidden">
              {seller.store.name}
            </h1>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Link
            href={'#'}
            className="flex gap-1 items-center border-[1px] border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-full px-3 py-2 font-aktivGroteskBold">
            <FaPowerOff className="text-md" /> Order Now
          </Link>
        </div>
      </div>
    </nav>
  );
};
