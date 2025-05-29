'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import dokmaiwithtext from '@/assets/images/dokmaiwithtext.png';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import { FaPowerOff } from 'react-icons/fa';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { useSellerDashboard } from '@/context/SellerDashboardContext';
import { Package, BarChart3, ShoppingBag, Power, Store, Menu } from 'lucide-react';

const SellerNavbar = () => {
  const { seller, logout } = useSellerAuth();
  const { activeView, setActiveView } = useSellerDashboard();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (
    view: 'profile' | 'products' | 'orders' | 'analytics' | 'edit-profile'
  ) => {
    setActiveView(view);
    setIsMenuOpen(false);
  };

  const isActive = (view: string) => activeView === view;

  return (
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
            <h1 className="font-aktivGroteskBold text-xs px-2 py-1 group-hover:border-dark-300 border-dark-700 border-[1px] rounded-full group-hover:bg-dark-700 tracking-widest text-light-500 transition-all duration-500 xl:hidden">
              {seller.store.name}
            </h1>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          {seller ? (
            <>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden flex gap-1 items-center bg-dark-600 hover:bg-dark-500 text-light-100 text-xs rounded-full p-2 font-aktivGroteskBold border-[1px] border-dark-400">
                <Menu size={16} />
              </button>

              <div
                className={`md:hidden fixed top-20 right-5 bg-dark-700 rounded-xl border border-dark-400 overflow-hidden transition-all duration-300 ${
                  isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}>
                <div className="flex flex-col ">
                  <button
                    onClick={() => handleNavigation('profile')}
                    className={`flex gap-1 items-center ${
                      isActive('profile')
                        ? 'bg-dark-500 text-light-100'
                        : 'bg-dark-600 hover:bg-dark-500 text-light-100 '
                    } text-xs p-3 font-aktivGroteskBold transition-all duration-300 w-full justify-center`}>
                    <Store size={16} /> Profile
                  </button>
                  <button
                    onClick={() => handleNavigation('products')}
                    className={`flex gap-1 items-center ${
                      isActive('products')
                        ? 'bg-dark-500 text-light-100'
                        : 'bg-dark-600 hover:bg-dark-500 text-light-100 '
                    } text-xs p-3 font-aktivGroteskBold transition-all duration-300 w-full justify-center`}>
                    <Package size={16} /> Products
                  </button>
                  <button
                    onClick={() => handleNavigation('orders')}
                    className={`flex gap-1 items-center ${
                      isActive('orders')
                        ? 'bg-dark-500 text-light-100'
                        : 'bg-dark-600 hover:bg-dark-500 text-light-100 '
                    } text-xs p-3 font-aktivGroteskBold transition-all duration-300 w-full justify-center`}>
                    <ShoppingBag size={16} /> Orders
                  </button>
                  <button
                    onClick={() => handleNavigation('analytics')}
                    className={`flex gap-1 items-center ${
                      isActive('analytics')
                        ? 'bg-dark-500 text-light-100'
                        : 'bg-dark-600 hover:bg-dark-500 text-light-100 '
                    } text-xs p-3 font-aktivGroteskBold transition-all duration-300 w-full justify-center`}>
                    <BarChart3 size={16} /> Analytics
                  </button>
                  <button
                    onClick={logout}
                    className="flex gap-1 items-center text-red-500 bg-red-500/10 hover:bg-red-500/20 text-xs p-3 font-aktivGroteskBold transition-all duration-300 w-full justify-center">
                    <Power size={16} /> Logout
                  </button>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => handleNavigation('profile')}
                  className={`flex gap-1 items-center ${
                    isActive('profile')
                      ? 'bg-dark-500 text-light-100 border-dark-300'
                      : 'bg-dark-600 hover:bg-dark-500 text-light-100 border-dark-400'
                  } text-xs rounded-full px-3 py-2 font-aktivGroteskBold border-[1px] transition-all duration-300`}>
                  <Store size={16} /> Profile
                </button>
                <button
                  onClick={() => handleNavigation('products')}
                  className={`flex gap-1 items-center ${
                    isActive('products')
                      ? 'bg-dark-500 text-light-100 border-dark-300'
                      : 'bg-dark-600 hover:bg-dark-500 text-light-100 border-dark-400'
                  } text-xs rounded-full px-3 py-2 font-aktivGroteskBold border-[1px] transition-all duration-300`}>
                  <Package size={16} /> Products
                </button>
                <button
                  onClick={() => handleNavigation('orders')}
                  className={`flex gap-1 items-center ${
                    isActive('orders')
                      ? 'bg-dark-500 text-light-100 border-dark-300'
                      : 'bg-dark-600 hover:bg-dark-500 text-light-100 border-dark-400'
                  } text-xs rounded-full px-3 py-2 font-aktivGroteskBold border-[1px] transition-all duration-300`}>
                  <ShoppingBag size={16} /> Orders
                </button>
                <button
                  onClick={() => handleNavigation('analytics')}
                  className={`flex gap-1 items-center ${
                    isActive('analytics')
                      ? 'bg-dark-500 text-light-100 border-dark-300'
                      : 'bg-dark-600 hover:bg-dark-500 text-light-100 border-dark-400'
                  } text-xs rounded-full px-3 py-2 font-aktivGroteskBold border-[1px] transition-all duration-300`}>
                  <BarChart3 size={16} /> Analytics
                </button>
                <button
                  onClick={logout}
                  className="flex gap-1 items-center border-[1px] border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs rounded-full px-3 py-2 font-aktivGroteskBold">
                  <Power size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <Link
              href={'/auth/login'}
              onClick={logout}
              className="flex gap-1 items-center border-[1px] border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-full px-3 py-2 font-aktivGroteskBold">
              <FaPowerOff className="text-md" /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SellerNavbar;
