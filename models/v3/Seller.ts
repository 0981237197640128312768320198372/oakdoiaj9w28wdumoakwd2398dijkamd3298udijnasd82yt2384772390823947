import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

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
  logoUrl?: string;
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

const sellerSchema = new Schema<ISeller>(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address'],
    },
    password: { type: String, required: true },
    contact: {
      facebook: { type: String, default: null },
      line: { type: String, default: null },
      instagram: { type: String, default: null },
      whatsapp: { type: String, default: null },
    },
    store: {
      name: { type: String, required: true },
      description: { type: String, required: true },
      logoUrl: { type: String, default: null },
      rating: { type: Number, default: 0 },
      credits: {
        positive: { type: Number, default: 0 },
        negative: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password
sellerSchema.pre('save', async function (next) {
  const seller = this as ISeller;
  if (!seller.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    seller.password = await bcrypt.hash(seller.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Seller = model<ISeller>('Seller', sellerSchema);
