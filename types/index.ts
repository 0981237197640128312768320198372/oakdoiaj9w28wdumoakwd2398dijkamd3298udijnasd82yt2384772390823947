/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Seller {
  _id: string;
  username: string;
  email: string;
  contact: {
    facebook?: string;
    line?: string;
    instagram?: string;
    whatsapp?: string;
  };
  store: {
    name: string;
    description: string;
    logoUrl?: string;
    rating: number;
    credits: {
      positive: number;
      negative: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  seller: Seller | null;
  login: (token: string) => void;
  logout: () => void;
}

export interface DepositFormProps {
  // Add any props if needed
}

export interface PaymentStep {
  id: number;
  title: string;
  description: string;
}

export interface DepositState {
  personalKey: string;
  amount: number;
  qrCodeData: string;
  paymentIntentId: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  error: string;
  timer: number;
  bonusPercentage: number | string;
  loading: boolean;
}

export interface SuccessData {
  message: string;
  personalKey: string;
  depositAmount: number;
  bonusAmount: number;
  totalDepositAmount: number;
  newBalance: number;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  stock: number;
  type: string;
  details: any;
  categoryId: string;
  price: number;
  images: string[];
  status: 'active' | 'draft';
}

export interface Category {
  _id: string;
  name: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  stock: number;
  type: string;
  details: any;
  categoryId: string;
  price: number;
  images: string[];
  status: 'active' | 'draft';
}

export type FormErrors = {
  [key in keyof ProductFormData]?: string;
};
