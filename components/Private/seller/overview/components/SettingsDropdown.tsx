/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, User, Eye, BarChart3 } from 'lucide-react';
import { ThemeCustomizerModal } from '../modals/ThemeCustomizerModal';
import { ProfileEditModal } from '../modals/ProfileEditModal';

interface SettingsDropdownProps {
  onClose: () => void;
  seller: any;
}

export function SettingsDropdown({ onClose, seller }: SettingsDropdownProps) {
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuItems = [
    {
      icon: Palette,
      label: 'Theme Customizer',
      onClick: () => {
        setShowThemeModal(true);
        onClose();
      },
    },
    {
      icon: User,
      label: 'Edit Profile',
      onClick: () => {
        setShowProfileModal(true);
        onClose();
      },
    },
    {
      icon: Eye,
      label: 'Preview Store',
      onClick: () => {
        window.open(`https://${seller?.username}.dokmai.store`, '_blank');
        onClose();
      },
    },
    {
      icon: BarChart3,
      label: 'Advanced Analytics',
      onClick: () => {
        // TODO: Navigate to analytics page
        onClose();
      },
    },
  ];

  return (
    <>
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-48 bg-dark-700 border border-dark-600 rounded-lg shadow-lg z-50">
        <div className="p-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-light-300 hover:text-white hover:bg-dark-600 rounded-lg transition-colors">
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showThemeModal && (
        <ThemeCustomizerModal
          isOpen={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          seller={seller}
        />
      )}

      {showProfileModal && (
        <ProfileEditModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          seller={seller}
        />
      )}
    </>
  );
}
