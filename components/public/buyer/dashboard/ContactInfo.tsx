/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Mail, Facebook, Instagram, Phone, MessageSquare, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface ContactInfoProps {
  buyer: any;
  theme: ThemeType | null;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ buyer, theme }) => {
  const themeUtils = useThemeUtils(theme);

  const contactItems = [
    {
      icon: Mail,
      label: 'Email',
      value: buyer.email,
      href: `mailto:${buyer.email}`,
      color: 'text-gray-600',
    },
    {
      icon: Facebook,
      label: 'Facebook',
      value: buyer.contact?.facebook,
      href: buyer.contact?.facebook ? `https://${buyer.contact.facebook}` : null,
      color: 'text-blue-600',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: buyer.contact?.instagram,
      href: buyer.contact?.instagram
        ? `https://instagram.com/${buyer.contact.instagram.replace('@', '')}`
        : null,
      color: 'text-pink-600',
    },
    {
      icon: Phone,
      label: 'WhatsApp',
      value: buyer.contact?.whatsapp,
      href: buyer.contact?.whatsapp
        ? `https://wa.me/${buyer.contact.whatsapp.replace(/\D/g, '')}`
        : null,
      color: 'text-green-600',
    },
    {
      icon: MessageSquare,
      label: 'Line',
      value: buyer.contact?.line,
      href: buyer.contact?.line
        ? `https://line.me/ti/p/${buyer.contact.line.replace('@', '')}`
        : null,
      color: 'text-green-500',
    },
  ].filter((item) => item.value); // Only show items with values

  return (
    <div
      className={cn(
        'p-4 border backdrop-blur-sm transition-all duration-300',
        themeUtils.getCardClass(),
        themeUtils.getComponentRoundednessClass(),
        themeUtils.getComponentShadowClass()
      )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageSquare size={16} />
          Contact Information
        </h3>
        <button
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-all duration-300',
            themeUtils.getCardClass(),
            themeUtils.getComponentRoundednessClass(),
            'border hover:shadow-sm'
          )}>
          <Edit size={12} />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contactItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            className={cn(
              'flex items-center gap-3 p-3 border transition-all duration-300 hover:shadow-sm',
              themeUtils.getCardClass(),
              themeUtils.getComponentRoundednessClass()
            )}>
            <div className={cn('p-2 rounded-lg bg-gray-50 dark:bg-gray-800')}>
              <item.icon size={14} className={item.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.label}</p>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'text-xs text-gray-900 dark:text-gray-100 hover:underline truncate block',
                    item.color
                  )}>
                  {item.value}
                </a>
              ) : (
                <p className="text-xs text-gray-900 dark:text-gray-100 truncate">{item.value}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {contactItems.length === 1 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Add more contact methods to help sellers reach you
          </p>
          <button
            className={cn(
              'mt-2 px-3 py-1.5 text-xs font-medium transition-all duration-300',
              themeUtils.getButtonClass(),
              themeUtils.getComponentRoundednessClass()
            )}>
            Add Contact Info
          </button>
        </div>
      )}
    </div>
  );
};
