'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useBuyerDetailsWithSWR } from '@/hooks/useBuyerDetailsWithSWR';
import { Mail, Facebook, Instagram, Phone, MessageSquare, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

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

interface ContactInfoProps {
  buyer: Buyer;
  theme: ThemeType | null;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ buyer: initialBuyer, theme }) => {
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
      icon: Mail,
      label: 'Email',
      value: localBuyer.email,
      href: `mailto:${localBuyer.email}`,
      color: 'text-gray-600 dark:text-gray-400',
      description: 'Primary email address',
    },
    {
      icon: Facebook,
      label: 'Facebook',
      value: localBuyer.contact?.facebook,
      href: localBuyer.contact?.facebook ? `https://${localBuyer.contact.facebook}` : null,
      color: 'text-blue-600 dark:text-blue-400',
      description: 'Facebook profile',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: localBuyer.contact?.instagram,
      href: localBuyer.contact?.instagram
        ? `https://instagram.com/${localBuyer.contact.instagram.replace('@', '')}`
        : null,
      color: 'text-pink-600 dark:text-pink-400',
      description: 'Instagram profile',
    },
    {
      icon: Phone,
      label: 'WhatsApp',
      value: localBuyer.contact?.whatsapp,
      href: localBuyer.contact?.whatsapp
        ? `https://wa.me/${localBuyer.contact.whatsapp.replace(/\D/g, '')}`
        : null,
      color: 'text-green-600 dark:text-green-400',
      description: 'WhatsApp number',
    },
    {
      icon: MessageSquare,
      label: 'Line',
      value: localBuyer.contact?.line,
      href: localBuyer.contact?.line
        ? `https://line.me/ti/p/${localBuyer.contact.line.replace('@', '')}`
        : null,
      color: 'text-green-500 dark:text-green-400',
      description: 'Line ID',
    },
  ].filter((item) => item.value); // Only show items with values

  return (
    <div className="p-5 md:p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageSquare size={16} className="text-purple-500" />
          Contact Information
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          These contact methods are visible to sellers you interact with
        </p>
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
              <div
                className={cn(
                  'p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors group-hover:bg-opacity-80'
                )}>
                <item.icon size={16} className={item.color} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.label}</p>
                <div className="flex items-center gap-1">
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'text-sm font-medium hover:underline truncate block group-hover:opacity-90 transition-opacity',
                        item.color
                      )}>
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
                <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed rounded-lg">
          <MessageSquare className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">No contact methods available</p>
          <p className="text-xs text-gray-500 mt-1">
            Add contact methods to help sellers reach you
          </p>
          <button
            onClick={() =>
              document.querySelector<HTMLButtonElement>('[data-edit-profile]')?.click()
            }
            className={cn(
              'mt-4 px-4 py-2 text-xs font-medium transition-all duration-300',
              themeUtils.getButtonClass(),
              themeUtils.getComponentRoundednessClass()
            )}>
            Add Contact Info
          </button>
        </div>
      )}

      {contactItems.length === 1 && (
        <div className="mt-6 text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Add more contact methods to help sellers reach you easily
          </p>
        </div>
      )}
    </div>
  );
};
