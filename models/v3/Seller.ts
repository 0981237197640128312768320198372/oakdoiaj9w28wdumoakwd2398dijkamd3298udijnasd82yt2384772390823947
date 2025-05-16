import { Schema, model, Document } from 'mongoose';

interface IContact {
  facebook?: string;
  line?: string;
  instagram?: string;
  whatsapp?: string;
}

interface IStoreCredits {
  positive: number;
  negative: number;
}

interface IStore {
  name: string;
  description: string;
  logoUrl: string;
  rating: number;
  credits: IStoreCredits;
}

interface ISeller extends Document {
  username: string;
  email: string;
  password: string;
  contact: IContact;
  store: IStore;
  createdAt: Date;
  updatedAt: Date;
}

const sellerSchema = new Schema<ISeller>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: {
    facebook: String,
    line: String,
    instagram: String,
    whatsapp: String,
  },
  store: {
    name: { type: String, required: true },
    description: { type: String, required: true },
    logoUrl: { type: String },
    rating: { type: Number, default: 0 },
    credits: {
      positive: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Seller = model<ISeller>('Seller', sellerSchema);
