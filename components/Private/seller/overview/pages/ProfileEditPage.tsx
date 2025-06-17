/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ArrowLeft, User } from 'lucide-react';
import EditProfile from '@/components/Private/seller/profile/EditProfile';

interface ProfileEditPageProps {
  seller: any;
  onBack: () => void;
}

export function ProfileEditPage({ seller, onBack }: ProfileEditPageProps) {
  const handleProfileUpdated = () => {
    // Optionally show a success message or refresh data
    setTimeout(() => {
      onBack();
    }, 1000);
  };

  return (
    <div className="space-y-5 px-5 lg:px-0 max-w-screen-lg min-h-[75vh]">
      {/* Header */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            aria-label="Back to overview">
            <ArrowLeft className="w-4 h-4 text-light-400" />
          </button>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-medium text-white">Edit Profile</h1>
          </div>
        </div>
        <p className="text-xs text-light-400 mt-2 ml-12">
          Update your store information and settings
        </p>
      </div>

      {/* Content */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
        <EditProfile seller={seller} onProfileUpdated={handleProfileUpdated} />
      </div>
    </div>
  );
}
