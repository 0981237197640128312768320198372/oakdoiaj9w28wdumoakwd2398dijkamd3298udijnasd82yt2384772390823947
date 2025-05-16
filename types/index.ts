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
