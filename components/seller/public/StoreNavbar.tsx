/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dokmaiwithtext from '@/assets/images/dokmaiwithtext.png';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import { ShoppingCart, Search } from 'lucide-react';
import SearchModal from './SearchModal';

interface StoreNavbarProps {
  seller: any;
}

export const StoreNavbar: React.FC<StoreNavbarProps> = ({ seller }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <nav className="fixed flex flex-col px-5 xl:p-0 items-center justify-center top-0 left-0 w-full transition-transform duration-500 z-50 transform">
        <div className="w-full mt-5 gap-10 bg-dark-700 flex py-1 px-2 lg:p-2 rounded-full max-w-screen-lg justify-between duration-1000 items-center border-[1px] border-dark-500">
          <div className="flex items-center gap-1 w-fit select-none group transition-all duration-500">
            {seller ? (
              <>
                <div className="relative w-10 h-10 border-dark-400 border-[1px] overflow-hidden rounded-full bg-cover bg-center">
                  <Image
                    src={seller.store.logoUrl || dokmailogosquare}
                    alt={seller.store.name}
                    width={100}
                    height={100}
                    className="border-[1px] border-dark-600 w-full h-full overflow-hidden rounded-full"
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
              <h1 className="font-aktivGroteskBold text-sm px-2 py-1 group-hover:border-dark-300 border-dark-700 border-[1px] rounded-full group-hover:bg-dark-700 tracking-widest text-light-100 transition-all duration-500">
                {seller.store.name}
              </h1>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 xl:mr-1 font-aktivGroteskRegular">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center text-xs justify-start w-40 xl:w-96 gap-3 border-[1px] border-dark-400 hover:border-dark-300 bg-dark-600 hover:bg-dark-500 text-light-600 hover:text-light-100 rounded-full px-2 py-1 transition-colors duration-200">
              <Search className="text-sm" /> Search
            </button>
          </div>
        </div>
      </nav>

      {seller && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          storeUsername={seller.username}
        />
      )}
    </>
  );
};
