/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
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
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface StoreFooterProps {
  seller: any;
  theme: ThemeType | null;
}

export default function StoreFooter({ seller, theme }: StoreFooterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Use the centralized theme utility
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
    <footer className={cn('w-full py-8 pt-16 pb-36 px-5 xl:px-0 ', footerStyles.background)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-screen-lg mx-auto font-aktivGroteskRegular">
        <div className="flex flex-col gap-6">
          <div
            className={cn(
              'grid grid-cols-1 lg:grid-cols-2 gap-5 rounded-xl',
              themeUtils.getCardClass()
            )}>
            {/* Store Info Card */}
            <div className="p-4 flex flex-col items-start gap-5">
              <div className="flex items-center gap-3 w-full">
                <div
                  className={cn(
                    'relative w-12 h-12 overflow-hidden bg-cover bg-center flex-shrink-0 border-[1px]',
                    themeUtils.getComponentRoundednessClass(),
                    themeUtils.baseTheme === 'light' ? 'border-light-300' : 'border-dark-400'
                  )}>
                  <Image
                    src={seller?.store?.logoUrl || dokmailogosquare}
                    alt={seller?.store?.name || 'Store logo'}
                    width={100}
                    height={100}
                    className={cn(
                      'w-full h-full overflow-hidden object-cover border-[1px]',
                      themeUtils.getComponentRoundednessClass(),
                      themeUtils.baseTheme === 'light' ? 'border-light-400' : 'border-dark-600'
                    )}
                  />
                </div>
                <div className="flex flex-col">
                  <h3
                    className={cn(
                      'font-aktivGroteskBold text-sm tracking-widest',
                      footerStyles.text
                    )}>
                    {seller?.store?.name || 'Store Name'}
                  </h3>
                </div>
              </div>

              {/* Mobile Social Links */}
              <div className="flex md:hidden flex-wrap gap-2">
                {socialLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 p-2 transition-all duration-200 text-xs',
                      themeUtils.getButtonClass('secondary')
                    )}
                    aria-label={link.name}>
                    {link.icon}
                    <span className="hidden sm:inline">{link.name}</span>
                  </Link>
                ))}
              </div>

              <p className={cn('text-xs', footerStyles.secondaryText)}>
                {seller?.store?.description ||
                  'Welcome to our store. We offer high-quality products with excellent customer service.'}
              </p>
            </div>

            {/* Desktop Social & Search Card */}
            <div className="p-5 hidden md:flex flex-col items-start gap-5 md:col-span-2 lg:col-span-1">
              {/* Search Button */}
              <button
                onClick={handleSearch}
                className={cn(
                  'relative w-full px-4 py-2 text-xs transition-colors border-[1px]',
                  footerStyles.searchBg,
                  themeUtils.getButtonRoundednessClass()
                )}
                aria-label="Search App Premium">
                <span
                  className={cn(
                    'block pr-8 text-start',
                    themeUtils.baseTheme === 'light' ? 'text-dark-500' : 'text-light-100/50'
                  )}>
                  Search Anything
                </span>
                <div
                  className={cn(
                    'absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 hover:opacity-90 transition-all',
                    themeUtils.getPrimaryColorClass('bg'),
                    themeUtils.buildColorClass(themeUtils.buttonTextColor, 'text'),
                    themeUtils.getButtonRoundednessClass()
                  )}>
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
                    className={cn(
                      'text-xs',
                      themeUtils.getButtonClass('secondary'),
                      themeUtils.getButtonRoundednessClass()
                    )}
                    aria-label={link.name}>
                    {link.icon}
                    <span className="hidden sm:inline">{link.name}</span>
                  </Link>
                ))}
              </div>

              <p className={cn('text-xs font-light', footerStyles.secondaryText)}>
                © {currentYear} Dokmai Store
              </p>
            </div>
          </div>

          <div
            className={cn(
              'w-full flex gap-4 lg:gap-0 justify-between px-4 py-3 items-center ',
              themeUtils.getCardClass(),
              themeUtils.getComponentRoundednessClass()
            )}>
            <div className="flex flex-col text-start px-3">
              <h4 className={cn('text-xs md:text-lg font-bold', footerStyles.text)}>
                Start Selling with Dokmai Store For FREE Now!
              </h4>
              <p className={cn('font-light text-xs md:text-sm', footerStyles.secondaryText)}>
                Open Store and Get Profit
              </p>
            </div>
            <Link
              href="https://dokmaistore.com"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'text-xs sm:text-sm bg-primary text-dark-800 rounded-full flex gap-1 items-center px-2 py-1 font-bold'
              )}>
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
