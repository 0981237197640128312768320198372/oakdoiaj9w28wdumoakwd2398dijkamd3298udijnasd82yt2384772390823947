/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import EditProfileModal from './EditProfileModal';

interface EditProfileButtonProps {
  seller: any;
  onProfileUpdated: () => void;
}

const EditProfileButton: React.FC<EditProfileButtonProps> = ({ seller, onProfileUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 border border-primary/30">
        <Edit2 size={16} />
        <span>Edit Profile</span>
      </button>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        seller={seller}
        onProfileUpdated={onProfileUpdated}
      />
    </>
  );
};

export default EditProfileButton;
