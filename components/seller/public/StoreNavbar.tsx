/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import type React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import dokmaiwithtext from '@/assets/images/dokmaiwithtext.png';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import { Search, Home, User, Package } from 'lucide-react';
import SearchModal from './SearchModal';

interface StoreNavbarProps {
  seller: any;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const StoreNavbar: React.FC<StoreNavbarProps> = ({ seller, activePage, onNavigate }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = () => {
    setIsSearchOpen(true);
  };

  return (
    <>
      <nav className="fixed flex flex-col px-5 xl:p-0 items-center justify-center top-0 left-0 w-full transition-transform duration-500 z-50 transform">
        <div className="w-full mt-5 gap-4 bg-dark-700 flex py-1 px-2 lg:p-2 rounded-full max-w-screen-lg justify-between duration-1000 items-center border-[1px] border-dark-500">
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
                  src={dokmaiwithtext || '/placeholder.svg'}
                  loading="lazy"
                  alt="Logo of Dokmai Store"
                  className="duration-700 hidden max-xl:h-10 max-xl:w-auto xl:block"
                />
                <Image
                  width={60}
                  height={60}
                  src={dokmailogosquare || '/placeholder.svg'}
                  loading="lazy"
                  alt="Logo of Dokmai Store"
                  className="duration-700 max-xl:h-10 max-xl:w-auto xl:hidden"
                />
              </>
            )}
            {seller && (
              <h1 className="font-aktivGroteskBold sm:hidden select-none text-sm px-2 py-1 group-hover:border-dark-300 border-dark-700 border-[1px] rounded-full group-hover:bg-dark-700 tracking-widest text-light-100 transition-all duration-500">
                {seller.store.name}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            <NavButton
              icon={<Home size={18} />}
              label="Home"
              isActive={activePage === 'home'}
              onClick={() => onNavigate('home')}
            />
            <NavButton
              icon={<User size={18} />}
              label="Profile"
              isActive={activePage === 'profile'}
              onClick={() => onNavigate('profile')}
            />
            <NavButton
              icon={<Package size={18} />}
              label="Products"
              isActive={activePage === 'products'}
              onClick={() => onNavigate('products')}
            />
          </div>

          <NavButton
            icon={<Search size={18} />}
            label="Search"
            isActive={false}
            onClick={handleSearch}
          />
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

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
        isActive
          ? 'bg-primary text-dark-800 font-medium'
          : 'bg-dark-600 text-light-300 hover:bg-dark-500 hover:text-light-100'
      }`}>
      {icon}
      <span className="hidden md:inline text-sm">{label}</span>
    </button>
  );
};
