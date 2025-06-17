/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { X, User } from 'lucide-react';
import EditProfile from '@/components/private/seller/profile/EditProfile';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: any;
}

export function ProfileEditModal({ isOpen, onClose, seller }: ProfileEditModalProps) {
  const handleProfileUpdated = () => {
    // Refresh seller data or handle update
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-600">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium text-white">Edit Profile</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-light-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <EditProfile seller={seller} onProfileUpdated={handleProfileUpdated} />
        </div>
      </div>
    </div>
  );
}
