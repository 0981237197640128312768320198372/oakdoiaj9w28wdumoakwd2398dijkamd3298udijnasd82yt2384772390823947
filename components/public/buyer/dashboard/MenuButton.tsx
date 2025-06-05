import { useThemeUtils } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import type { ThemeType } from '@/types';
import { Menu as MenuIcon, ChevronDown } from 'lucide-react';

interface MenuButtonProps {
  handleEditProfile: () => void;
  handleLogout: () => void;
  theme: ThemeType | null;
}

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.414 2.586a2 2 0 010 2.828l-1.414 1.414-2.828-2.828L14.586 2.586a2 2 0 012.828 0zM2 13.414V16h2.586l9.9-9.9-2.586-2.586L2 13.414z" />
  </svg>
);

const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 4a1 1 0 011-1h6a1 1 0 110 2H5v10h5a1 1 0 110 2H4a1 1 0 01-1-1V4z" />
    <path d="M13 7l3 3-3 3v-2H8V9h5V7z" />
  </svg>
);

const MenuButton: React.FC<MenuButtonProps> = ({ handleEditProfile, handleLogout, theme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const themeUtils = useThemeUtils(theme ?? null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-300',
          themeUtils.getButtonClass(),
          themeUtils.getComponentRoundednessClass()
        )}>
        <MenuIcon size={16} />
        <span className="hidden sm:inline">เมนู</span>
        <ChevronDown size={14} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>
      {menuOpen && (
        <div
          className={cn(
            'absolute right-0 mt-1 w-48 z-10 border shadow-lg',
            themeUtils.getCardClass(),
            themeUtils.getComponentRoundednessClass()
          )}>
          <button
            onClick={() => {
              handleEditProfile();
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors">
            <EditIcon className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 transition-colors">
            <LogoutIcon className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuButton;
