'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeType } from '@/lib/utils';

interface StoreNavbarProps {
  storeName: string;
  username: string;
  theme: ThemeType;
  buttonStyles: React.CSSProperties;
}

export const StoreNavbar: React.FC<StoreNavbarProps> = ({
  storeName,
  username,
  theme,
  buttonStyles,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [{ name: 'Store Profile', href: `/${username}`, icon: <Store size={16} /> }];

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={{
          backgroundColor: isScrolled ? `${theme.secondaryColor}CC` : 'transparent',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          boxShadow: isScrolled
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            : 'none',
        }}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo/Store Name */}
          <Link
            href={`/${username}`}
            className="text-xl font-bold flex items-center gap-2 transition-transform hover:scale-105"
            style={{ color: theme.primaryColor }}>
            {theme.logoUrl && (
              <div
                className="w-8 h-8 relative overflow-hidden rounded-full border-2"
                style={{ borderColor: theme.primaryColor }}>
                <Image src={theme.logoUrl} alt={storeName} fill className="object-cover" />
              </div>
            )}
            <span>{storeName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-1.5 px-4 py-2 transition-all duration-200 hover:scale-105"
                style={buttonStyles}>
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full"
            style={{ color: theme.primaryColor }}
            aria-label="Toggle menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden overflow-hidden"
            style={{ backgroundColor: `${theme.secondaryColor}F0`, backdropFilter: 'blur(10px)' }}>
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2 p-3 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: `${theme.primaryColor}20`,
                    color: theme.primaryColor,
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
