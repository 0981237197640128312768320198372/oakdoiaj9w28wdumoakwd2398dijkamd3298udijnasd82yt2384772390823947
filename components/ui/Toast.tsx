import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Handle automatic toast hiding
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newValue = prev - 100 / (duration / 100);
        return newValue < 0 ? 0 : newValue;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, onClose]);

  // Toast type styling
  const typeStyles = {
    success: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-500 dark:border-green-600',
      text: 'text-green-800 dark:text-green-200',
      icon: <CheckCircle size={20} className="text-green-500 dark:text-green-400" />,
      progress: 'bg-green-500 dark:bg-green-400',
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-500 dark:border-red-600',
      text: 'text-red-800 dark:text-red-200',
      icon: <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />,
      progress: 'bg-red-500 dark:bg-red-400',
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-500 dark:border-blue-600',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <Info size={20} className="text-blue-500 dark:text-blue-400" />,
      progress: 'bg-blue-500 dark:bg-blue-400',
    },
    warning: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      border: 'border-amber-500 dark:border-amber-600',
      text: 'text-amber-800 dark:text-amber-200',
      icon: <AlertTriangle size={20} className="text-amber-500 dark:text-amber-400" />,
      progress: 'bg-amber-500 dark:bg-amber-400',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`max-w-md w-full p-4 rounded-lg shadow-lg border-l-4 ${style.border} ${style.bg} ${
        isVisible ? 'animate-slide-in-right' : 'animate-slide-out-right'
      } relative overflow-hidden`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{style.icon}</div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${style.text}`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`ml-4 flex-shrink-0 ${style.text} hover:text-opacity-80 focus:outline-none`}>
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-1 transition-all duration-100"
        style={{ width: `${progress}%`, backgroundColor: style.progress }}></div>
    </div>
  );
};

// Toast Container to manage multiple toasts
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 items-end">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;

export { Toast };
