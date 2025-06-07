import { useThemeUtils } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import type { ThemeType } from '@/types';
import { Menu as MenuIcon, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
interface MenuButtonProps {
  handleEditProfile: () => void;
  handleLogout: () => void;
  handleToggleContactList: () => void;
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

const ContactIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

const MenuButton: React.FC<MenuButtonProps> = ({
  handleEditProfile,
  handleLogout,
  handleToggleContactList,
  theme,
}) => {
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
          themeUtils.getComponentRoundednessClass(),
          themeUtils.getPrimaryColorClass('border')
        )}>
        <MenuIcon size={16} />
        <span className="hidden sm:inline">เมนู</span>
        <ChevronDown size={14} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'absolute right-0 mt-1 flex flex-col gap-1 w-40  z-10 border shadow-lg',
            themeUtils.getCardClass(),
            themeUtils.getComponentRoundednessClass()
          )}>
          <button
            onClick={() => {
              handleEditProfile();
              setMenuOpen(false);
            }}
            className="flex gap-2 w-full justify-center items-center px-4 py-2 text-sm transition-colors">
            <EditIcon className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
          <button
            onClick={() => {
              handleToggleContactList();
              setMenuOpen(false);
            }}
            className="flex gap-2 w-full justify-center items-center px-4 py-2 text-sm transition-colors">
            <ContactIcon className="w-4 h-4 mr-2" />
            Contact Info
          </button>
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="flex justify-center items-center gap-2 w-full px-4 py-2 text-sm text-red-500 transition-colors">
            <LogoutIcon className="w-4 h-4 mr-2" />
            Logout
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MenuButton;
