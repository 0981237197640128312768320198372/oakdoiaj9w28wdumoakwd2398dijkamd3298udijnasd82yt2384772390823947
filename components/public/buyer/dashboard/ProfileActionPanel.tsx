'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useBuyerDetailsWithSWR } from '@/hooks/useBuyerDetailsWithSWR';
import { ExternalLink, Menu, Edit, LogOut, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';
import { useBuyerAuth } from '@/hooks/useBuyerAuth';

import { FaFacebook } from 'react-icons/fa';
import { FaSquareInstagram } from 'react-icons/fa6';
import { BsLine } from 'react-icons/bs';
import { IoLogoWhatsapp } from 'react-icons/io';
import { MdOutlineMail } from 'react-icons/md';

interface Contact {
  facebook?: string;
  line?: string;
  instagram?: string;
  whatsapp?: string;
}

interface Buyer {
  _id?: string;
  name: string;
  username?: string;
  email: string;
  avatarUrl?: string;
  contact: Contact;
  balance?: number;
  storeId?: string;
  activities?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProfileActionPanelProps {
  buyer: Buyer;
  theme: ThemeType | null;
  onEditProfile?: () => void;
}

export const ProfileActionPanel: React.FC<ProfileActionPanelProps> = ({
  buyer: initialBuyer,
  theme,
  onEditProfile,
}) => {
  const { buyer } = useBuyerDetailsWithSWR();
  const [localBuyer, setLocalBuyer] = useState(initialBuyer);
  const [showMenu, setShowMenu] = useState(false);
  const [showContacts, setShowContacts] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useBuyerAuth();

  // Use the buyer from SWR if available, otherwise use the prop
  useEffect(() => {
    if (buyer) {
      setLocalBuyer(buyer);
    }
  }, [buyer]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const themeUtils = useThemeUtils(theme);

  const contactItems = [
    {
      icon: MdOutlineMail,
      label: 'อีเมล',
      value: localBuyer.email,
      href: `mailto:${localBuyer.email}`,
    },
    {
      icon: FaFacebook,
      label: 'เฟซบุ๊ก',
      value: localBuyer.contact?.facebook,
      href: localBuyer.contact?.facebook ? `https://${localBuyer.contact.facebook}` : null,
    },
    {
      icon: FaSquareInstagram,
      label: 'อินสตาแกรม',
      value: localBuyer.contact?.instagram,
      href: localBuyer.contact?.instagram
        ? `https://instagram.com/${localBuyer.contact.instagram.replace('@', '')}`
        : null,
    },
    {
      icon: IoLogoWhatsapp,
      label: 'วอตส์แอป',
      value: localBuyer.contact?.whatsapp,
      href: localBuyer.contact?.whatsapp
        ? `https://wa.me/${localBuyer.contact.whatsapp.replace(/\D/g, '')}`
        : null,
    },
    {
      icon: BsLine,
      label: 'ไลน์',
      value: localBuyer.contact?.line,
      href: localBuyer.contact?.line
        ? `https://line.me/ti/p/${localBuyer.contact.line.replace('@', '')}`
        : null,
    },
  ].filter((item) => item.value);

  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile();
    }
    setShowMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  return (
    <div className="p-5 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">ข้อมูลการติดต่อ</h3>
          <p className="text-xs text-gray-500 mt-1">
            ข้อมูลการติดต่อเหล่านี้จะแสดงให้ผู้ขายที่คุณมีปฏิสัมพันธ์ด้วยเห็น
          </p>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-300',
              themeUtils.getButtonClass(),
              themeUtils.getPrimaryColorClass('border'),
              themeUtils.getComponentRoundednessClass()
            )}>
            <Menu size={16} />
            <span className="hidden sm:inline">เมนู</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${showMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute right-0 mt-1 w-48 z-10 border shadow-lg',
                themeUtils.getCardClass(),
                themeUtils.getComponentRoundednessClass()
              )}>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowContacts(!showContacts);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <User size={16} />
                  {showContacts ? 'ซ่อนข้อมูลการติดต่อ' : 'แสดงข้อมูลการติดต่อ'}
                </button>
                <button
                  onClick={handleEditProfile}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Edit size={16} />
                  แก้ไขโปรไฟล์
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut size={16} />
                  ออกจากระบบ
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {contactItems.length > 0 && showContacts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contactItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className={cn(
                'flex items-center gap-3 p-4 border transition-all duration-300 hover:shadow-sm group',
                themeUtils.getCardClass(),
                themeUtils.getComponentRoundednessClass()
              )}>
              <div className={cn('p-2.5 rounded-lg transition-colors group-hover:bg-opacity-80')}>
                <item.icon size={16} className={cn(themeUtils.getPrimaryColorClass('text'))} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium ">{item.label}</p>
                <div className="flex items-center gap-1">
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.value}
                      <ExternalLink
                        size={12}
                        className="inline-block ml-1 opacity-70 group-hover:opacity-100"
                      />
                    </a>
                  ) : (
                    <p className="text-sm font-medium truncate">{item.value}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : contactItems.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-lg">
          <p className="text-sm ">ไม่มีข้อมูลการติดต่อ</p>
          <p className="text-xs text-gray-500 mt-1">
            เพิ่มข้อมูลการติดต่อเพื่อช่วยให้ผู้ขายติดต่อคุณได้
          </p>
          <button
            onClick={handleEditProfile}
            className={cn(
              'mt-4 px-4 py-2 text-xs font-medium transition-all duration-300',
              themeUtils.getButtonClass(),
              themeUtils.getComponentRoundednessClass()
            )}>
            เพิ่มข้อมูลการติดต่อ
          </button>
        </div>
      ) : null}

      {contactItems.length === 1 && showContacts && (
        <div className="mt-6 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs ">เพิ่มข้อมูลการติดต่อเพื่อช่วยให้ผู้ขายติดต่อคุณได้ง่ายขึ้น</p>
        </div>
      )}
    </div>
  );
};
