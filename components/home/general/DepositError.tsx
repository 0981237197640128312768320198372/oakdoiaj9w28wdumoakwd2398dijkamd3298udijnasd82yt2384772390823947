import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DepositErrorProps {
  message: string;
  onClose: () => void;
}

const DepositError: React.FC<DepositErrorProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 xl:top-40 right-5 xl:right-10 max-w-sm transition-all duration-300 transform z-50 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
      <div className="bg-dark-700 border-l-4 border-red-500 rounded shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-500">เกิดข้อผิดพลาด</h3>
            <div className="mt-1 text-sm text-gray-300">{message}</div>
          </div>
          <button
            className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-300"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositError;
