/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaFacebook } from 'react-icons/fa';
import { FaSquareInstagram } from 'react-icons/fa6';
import { BsLine } from 'react-icons/bs';
import { IoLogoWhatsapp } from 'react-icons/io';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { motion } from 'framer-motion';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import Link from 'next/link';
import { Search } from 'lucide-react';
import SearchModal from './SearchModal';

interface StoreFooterProps {
  seller: any;
  theme: any;
}

export default function StoreFooter({ seller, theme }: StoreFooterProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const currentYear = new Date().getFullYear();

  const primaryColor = theme?.customizations?.colors?.primary || theme?.primaryColor || '#B9FE13';
  const secondaryColor =
    theme?.customizations?.colors?.secondary || theme?.secondaryColor || '#0F0F0F';
  const textColor = theme?.customizations?.button?.textColor || theme?.textColor || '#ECECEC';
  const buttonBgColor =
    theme?.customizations?.button?.backgroundColor || theme?.buttonBgColor || '#B9FE13';
  const buttonTextColor =
    theme?.customizations?.button?.textColor || theme?.buttonTextColor || '#0F0F0F';

  const socialLinks = [
    {
      name: 'Facebook',
      url: seller?.contact?.facebook ? `https://${seller.contact.facebook}` : null,
      icon: <FaFacebook size={16} />,
    },
    {
      name: 'Instagram',
      url: seller?.contact?.instagram
        ? `https://instagram.com/${seller.contact.instagram.replace('@', '')}`
        : null,
      icon: <FaSquareInstagram size={16} />,
    },
    {
      name: 'Line',
      url: seller?.contact?.line
        ? `https://line.me/ti/p/${seller.contact.line.replace('@', '')}`
        : null,
      icon: <BsLine size={16} />,
    },
    {
      name: 'Whatsapp',
      url: seller?.contact?.whatsapp ? `https://wa.me/${seller.contact.whatsapp}` : null,
      icon: <IoLogoWhatsapp size={16} />,
    },
  ].filter((link) => link.url);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = () => {
    setIsSearchOpen(true);
  };
  return (
    <footer
      className="w-full py-8 mt-16 mb-32 px-5 xl:px-0"
      style={{
        backgroundColor: secondaryColor,
        color: textColor,
        fontFamily: theme?.fontFamily || 'AktivGrotesk-Regular',
      }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-screen-lg mx-auto">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-dark-700 border-[1px] border-dark-500 p-4 rounded-2xl flex flex-col items-start gap-5">
              <div className="flex items-center gap-3 w-full">
                <div className="relative w-12 h-12 border-dark-400 border-[1px] overflow-hidden rounded-full bg-cover bg-center flex-shrink-0">
                  <Image
                    src={seller?.store?.logoUrl || dokmailogosquare}
                    alt={seller?.store?.name || 'Store logo'}
                    width={100}
                    height={100}
                    className="border-[1px] border-dark-600 w-full h-full overflow-hidden rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-aktivGroteskBold text-sm tracking-widest text-light-100">
                    {seller?.store?.name || 'Store Name'}
                  </h3>
                  {/* <p className="text-[10px] text-light-400">Official Store</p> */}
                </div>
              </div>
              <div className="flex md:hidden flex-wrap gap-2">
                {socialLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-full transition-all duration-200 bg-dark-600 text-light-800 hover:bg-dark-500 hover:text-light-100 text-xs"
                    aria-label={link.name}>
                    {link.icon}
                    <span className="hidden sm:inline">{link.name}</span>
                  </Link>
                ))}
              </div>
              <p className="text-xs text-light-300">
                {seller?.store?.description ||
                  'Welcome to our store. We offer high-quality products with excellent customer service.'}
              </p>
            </div>

            <div className="bg-dark-700 border-[1px] border-dark-500 p-5 rounded-2xl hidden md:flex flex-col items-start gap-5 md:col-span-2 lg:col-span-1">
              <button
                onClick={handleSearch}
                className="relative w-full px-4 py-2 rounded-full bg-dark-600 border-[1px] border-dark-500 text-light-100 text-xs transition-colors"
                aria-label="Search App Premium">
                <span className="block pr-8 text-light-100/50 text-start">Search Anything</span>
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary text-dark-800 rounded-full p-1.5 hover:bg-opacity-90 transition-all">
                  <Search size={16} />
                </div>
              </button>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 bg-dark-600 text-light-300 hover:bg-dark-500 hover:text-light-100 text-xs"
                    aria-label={link.name}>
                    {link.icon}
                    <span className="hidden sm:inline">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full bg-dark-700 border-[1px] border-dark-500 flex gap-4 lg:gap-0 justify-between px-4 py-3 rounded-full items-center">
            <div className="flex flex-col text-start  px-3">
              <h4 className="text-xs md:text-lg font-bold text-light-100">
                Start Selling with Dokmai Store For FREE Now!
              </h4>
              <p className="font-light text-xs md:text-sm text-light-500">
                Open Store and Get Profit
              </p>
            </div>
            <Link
              href="https://dokmaistore.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex bg-primary w-fit font-bold items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-dark-800 text-xs sm:text-sm hover:bg-opacity-90 whitespace-nowrap">
              Learn More
              <HiOutlineArrowNarrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>
      {seller && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          storeUsername={seller.username}
        />
      )}
    </footer>
  );
}
