import { Schema, model, Document, models } from 'mongoose';
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
  theme: Schema.Types.ObjectId;
}

interface ISeller extends Document {
  username: string;
  email: string;
  password: string;
  contact: IContact;
  store: IStore;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const sellerSchema = new Schema<ISeller>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
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
      name: {
        type: String,
        required: true,
        index: true,
        minlength: [3, 'Store name must be at least 3 characters long'],
        maxlength: [50, 'Store name cannot exceed 50 characters'],
      },
      description: {
        type: String,
        required: true,
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [500, 'Description cannot exceed 500 characters'],
      },
      logoUrl: { type: String, default: null },
      rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
      },
      credits: {
        positive: { type: Number, default: 0 },
        negative: { type: Number, default: 0 },
      },
      theme: { type: Schema.Types.ObjectId, ref: 'Theme' },
    },
  },
  { timestamps: true }
);

sellerSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const Seller = models.Seller || model<ISeller>('Seller', sellerSchema);
