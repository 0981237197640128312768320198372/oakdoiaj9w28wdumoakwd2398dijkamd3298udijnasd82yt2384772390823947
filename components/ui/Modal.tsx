import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = 'md' }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Size classes mapping
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed h-screen w-screen inset-0 z-[9999] overflow-y-auto bg-dark-800/30 backdrop-blur flex items-center justify-center animate-fade-in">
      <div
        className={`${sizeClasses[size]} w-full bg-dark-800 rounded-xl shadow-xl transform transition-all duration-300 animate-scale-in`}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
