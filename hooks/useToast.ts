import { useState, useCallback } from 'react';
import { Toast } from '../components/ui/Toast';

const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, type: 'success', duration });
    },
    [addToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, type: 'error', duration });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, type: 'info', duration });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, type: 'warning', duration });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};

export default useToast;
