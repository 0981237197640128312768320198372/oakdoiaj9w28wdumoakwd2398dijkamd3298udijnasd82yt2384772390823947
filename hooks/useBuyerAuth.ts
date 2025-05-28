import { useBuyerAuth } from '@/context/BuyerAuthContext';

export { useBuyerAuth };

export const getBuyerToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('buyerToken');
  }
  return null;
};

export const clearBuyerAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('buyerToken');
  }
};
