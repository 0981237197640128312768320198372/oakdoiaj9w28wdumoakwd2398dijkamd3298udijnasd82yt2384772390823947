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

export interface DepositFormProps {}

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
  category: any;
  rating: string;
  _id: string;
  title: string;
  description: string;
  stock: number;
  type: string;
  details: any;
  sellerId: string;
  categoryId: string;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  images: string[];
  status: 'active' | 'draft';
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  parentId?: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  stock: number;
  details: any;
  categoryId: string;
  price: number;
  discountPercentage: number;
  images: string[];
  status: 'active' | 'draft';
}

export type FormErrors = {
  [key in keyof ProductFormData]?: string;
};
