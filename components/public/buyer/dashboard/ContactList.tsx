'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useBuyerDetailsWithSWR } from '@/hooks/useBuyerDetailsWithSWR';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

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

interface Balance {
  _id: string;
  buyerId: string;
  balanceType: string;
  amount: number;
  currency: string;
  status: string;
  lastUpdated: string;
}

interface Buyer {
  _id?: string;
  name: string;
  username?: string;
  email: string;
  avatarUrl?: string;
  contact: Contact;
  balance?: number | Balance | null;
  balanceId?: string;
  storeId?: string;
  activities?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ContactListProps {
  buyer: Buyer;
  theme: ThemeType | null;
}

export const ContactList: React.FC<ContactListProps> = ({ buyer: initialBuyer, theme }) => {
  const { buyer } = useBuyerDetailsWithSWR();
  const [localBuyer, setLocalBuyer] = useState(initialBuyer);

  // Use the buyer from SWR if available, otherwise use the prop
  useEffect(() => {
    if (buyer) {
      setLocalBuyer(buyer);
    }
  }, [buyer]);

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

  return (
    <div className="p-5 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">ข้อมูลการติดต่อ</h3>
          <p className="text-xs text-gray-500 mt-1">
            ข้อมูลการติดต่อเหล่านี้จะแสดงให้ผู้ขายที่คุณมีปฏิสัมพันธ์ด้วยเห็น
          </p>
        </div>
      </div>

      {contactItems.length > 0 ? (
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
                  <p className="text-sm font-medium truncate">{item.value}</p>
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
        </div>
      ) : null}

      {contactItems.length === 1 && (
        <div className="mt-6 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs ">เพิ่มข้อมูลการติดต่อเพื่อช่วยให้ผู้ขายติดต่อคุณได้ง่ายขึ้น</p>
        </div>
      )}
    </div>
  );
};
