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
    theme: any;
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

export interface DigitalInventory {
  _id?: string;
  productId?: string;
  sellerId: string;
  inventoryGroup: string;
  variantName?: string; // For backward compatibility
  digitalAssets: Array<Record<string, any>>;
  specifications?: Array<Record<string, any>>; // For backward compatibility
  createdAt?: string;
  updatedAt?: string;
}

// For backward compatibility
export interface ProductData extends DigitalInventory {}

export interface Product {
  createdAt: any;
  rating: string;
  _id: string;
  title: string;
  description: string;
  type: string;
  sellerId: string;
  categoryId: string;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  images: string[];
  status: 'active' | 'draft';
  category?: Category;
  _stock?: number;
  productDataId?: string;
  digitalInventoryId?: string;
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
  categoryId: string;
  price: number;
  discountPercentage: number;
  images: string[];
  status: 'active' | 'draft';
}

export type FormErrors = {
  [key in keyof ProductFormData]?: string;
};

export interface ThemeType {
  sellerId: string;
  baseTheme: 'light' | 'dark';
  customizations: {
    colors: {
      primary?: string;
      secondary?: string;
    };
    button: {
      textColor?: string;
      backgroundColor?: string;
      roundedness?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
      shadow?: 'none' | 'sm' | 'md' | 'lg';
      border?: 'none' | 'sm' | 'md' | 'lg';
      borderColor?: string;
    };
    componentStyles: {
      cardRoundedness?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
      cardShadow?: 'none' | 'sm' | 'md' | 'lg';
    };
    ads: {
      images?: string[];
      roundedness?: 'none' | 'sm' | 'md' | 'lg' | 'full';
      shadow?: 'none' | 'sm' | 'md' | 'lg';
    };
  };
}

// Buyer types for better type safety
export interface Buyer {
  id: string;
  email: string;
  username?: string;
  contact?: {
    facebook?: string;
    line?: string;
    instagram?: string;
    whatsapp?: string;
  };
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BuyerAuthContextType {
  buyer: Buyer | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
export interface BuyerTransaction {
  type: 'purchase' | 'deposit' | 'withdrawal' | 'refund' | 'other';
  amount: number;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
}

export interface SellerInteraction {
  id: string;
  seller: {
    id: string;
    username: string;
    storeName: string;
    logoUrl?: string;
  };
  action: 'review' | 'credit';
  rating?: number;
  credit?: {
    type: 'positive' | 'negative';
    value: number;
  };
  comment?: string;
  createdAt: string;
}
