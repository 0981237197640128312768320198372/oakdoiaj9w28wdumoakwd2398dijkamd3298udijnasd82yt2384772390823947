/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Palette, User, Eye, BarChart3 } from 'lucide-react';

interface SettingsDropdownProps {
  onClose: () => void;
  seller: any;
  onViewChange?: (view: 'theme-customizer' | 'edit-profile') => void;
}

export function SettingsDropdown({ onClose, seller, onViewChange }: SettingsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    // Add both click and keyboard event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleClickOutside, handleEscapeKey]);

  const menuItems = [
    {
      icon: Palette,
      label: 'Theme Customizer',
      onClick: () => {
        onViewChange?.('theme-customizer');
        onClose();
      },
    },
    {
      icon: User,
      label: 'Edit Profile',
      onClick: () => {
        onViewChange?.('edit-profile');
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
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 z-40 md:hidden" onClick={onClose} aria-hidden="true" />

      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-48 bg-dark-700 border border-dark-600 rounded-lg shadow-xl z-[9999] animate-in fade-in-0 zoom-in-95 duration-100"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="settings-menu-button">
        <div className="p-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                item.onClick();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-light-300 hover:text-white hover:bg-dark-600 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              role="menuitem"
              tabIndex={0}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
