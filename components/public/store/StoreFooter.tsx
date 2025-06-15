/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

import { FaFacebook } from 'react-icons/fa';
import { FaSquareInstagram } from 'react-icons/fa6';
import { BsLine } from 'react-icons/bs';
import { IoLogoWhatsapp } from 'react-icons/io';

import { motion } from 'framer-motion';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import Link from 'next/link';
import { Search } from 'lucide-react';
import SearchModal from './SearchModal';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';
import dokmaiwithtext from '@/assets/images/dokmaiwithtext.png';
import dokmaiwithblacktext from '@/assets/images/dokmaiwithblacktext.png';
import { VscTriangleRight } from 'react-icons/vsc';

interface StoreFooterProps {
  seller: any;
  theme: ThemeType | null;
}

export default function StoreFooter({ seller, theme }: StoreFooterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const themeUtils = useThemeUtils(theme);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const currentYear = new Date().getFullYear();
  const footerStyles = themeUtils.getFooterStyles();

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

  const handleSearch = () => {
    setIsSearchOpen(true);
  };

  return (
    <footer className={cn('w-full pt-5 pb-36 px-5 xl:px-0 text-xs', footerStyles.background)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-screen-lg mx-auto font-aktivGroteskRegular text-xs">
        <div className="flex flex-col gap-5">
          <div
            className={cn(
              'grid grid-cols-1 lg:grid-cols-2',
              themeUtils.getComponentRoundednessClass(),
              themeUtils.getCardClass()
            )}>
            <div className="p-4 flex flex-col items-start gap-5">
              <div className="flex items-center gap-3 w-full">
                <div
                  className={cn(
                    'relative w-12 h-12 overflow-hidden bg-cover bg-center flex-shrink-0 '
                  )}>
                  <Image
                    src={seller?.store?.logoUrl || dokmailogosquare}
                    alt={seller?.store?.name || 'Store logo'}
                    width={100}
                    height={100}
                    className={cn('w-full h-full overflow-hidden object-cover')}
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className={cn('font-aktivGroteskBold tracking-widest', footerStyles.text)}>
                    {seller?.store?.name || 'ชื่อร้าน'}
                  </h3>
                </div>
              </div>

              <p className={cn('', footerStyles.secondaryText)}>
                {seller?.store?.description ||
                  'Welcome to our store. We offer high-quality products with excellent customer service.'}
              </p>
            </div>

            <div className="p-5 justify-between flex flex-col items-start gap-5 md:col-span-2 lg:col-span-1">
              <button
                onClick={handleSearch}
                className={cn(
                  'relative w-full px-4 py-2 transition-colors border-[1px]',
                  footerStyles.searchBg,
                  themeUtils.getComponentRoundednessClass()
                )}
                aria-label="Search App Premium">
                <span
                  className={cn(
                    'block pr-8 text-start',
                    themeUtils.baseTheme === 'light' ? 'text-dark-500' : 'text-light-100/50',
                    themeUtils.getComponentRoundednessClass()
                  )}>
                  ค้นหา
                </span>
                <div
                  className={cn(
                    'absolute right-0 top-1/2 transform -translate-y-1/2 p-2 hover:opacity-90 transition-all',
                    themeUtils.getPrimaryColorClass('bg'),
                    themeUtils.buildColorClass(themeUtils.buttonTextColor, 'text'),
                    themeUtils.getComponentRoundednessClass()
                  )}>
                  <Search size={16} />
                </div>
              </button>

              <div className="flex flex-wrap gap-2 w-full justify-center lg:justify-end">
                {socialLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'py-1 px-2',
                      themeUtils.getButtonClass('secondary'),
                      themeUtils.getButtonRoundednessClass()
                    )}
                    aria-label={link.name}>
                    {link.icon}
                    <span className="hidden sm:inline">{link.name}</span>
                  </Link>
                ))}
              </div>

              <span
                className={cn(
                  'font-light flex gap-1 items-center w-full justify-center lg:justify-end',
                  footerStyles.secondaryText
                )}>
                Copyright © {currentYear},{' '}
                <p className="font-bold">{seller?.store?.name || 'Store Name'}</p>
                <p className="text-[9px]">Powered By</p>
                <Link
                  href="https://seller.dokmaistore.com/auth/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded">
                  <Image
                    src={themeUtils.baseTheme === 'light' ? dokmaiwithblacktext : dokmaiwithtext}
                    alt="Dokmai Store"
                    className="w-auto h-4 opacity-100 hover:scale-110 cursor-pointer duration-500 transition-all"
                  />
                </Link>
              </span>
            </div>
          </div>
          <div
            className={cn(
              'w-full flex gap-5 lg:gap-0 justify-between px-4 py-3 items-center ',
              themeUtils.getCardClass(),
              themeUtils.getComponentRoundednessClass()
            )}>
            <div className="flex flex-col text-start">
              <h4 className={cn('font-bold', footerStyles.text)}>
                สร้างเว็บไซต์ธุรกิจดิจิทัลของคุณด้วย Dokmai Store
              </h4>
              <p className={cn('font-light', footerStyles.secondaryText)}>
                รวดเร็ว ปรับแต่งได้ด้วยสไตล์ของคุณเอง
              </p>
            </div>
            <Link
              href="https://seller.dokmaistore.com/auth/register"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'bg-primary text-dark-800 rounded-full flex gap-1 items-center px-3 py-1 font-bold'
              )}>
              เริ่มเลย
              <VscTriangleRight size={14} />
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
