// models/v3/Seller.ts
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

interface ITheme {
  roundedness: 'rounded' | 'rounded-full' | 'square';
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  fontFamily: string;
  backgroundImage: string;
  buttonTextColor: string;
  buttonBgColor: string;
  buttonBorder: string;
  spacing: string;
  shadow: string;
  adsImageUrl: string;
}

interface IStore {
  name: string;
  description: string;
  logoUrl?: string;
  adsImageUrl?: string;
  rating: number;
  credits: IStoreCredits;
  theme: ITheme;
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
      name: { type: String, required: true, index: true },
      description: { type: String, required: true },
      logoUrl: { type: String, default: null },
      adsImageUrl: { type: String, default: null },
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
      theme: {
        roundedness: {
          type: String,
          enum: ['rounded', 'rounded-full', 'square'],
          default: 'rounded',
        },
        primaryColor: { type: String, default: '#B9FE13' },
        secondaryColor: { type: String, default: '#0F0F0F' },
        textColor: { type: String, default: '#ECECEC' },
        fontFamily: { type: String, default: 'AktivGrotesk-Regular' },
        backgroundImage: { type: String, default: null },
        buttonTextColor: { type: String, default: '#0F0F0F' },
        buttonBgColor: { type: String, default: '#B9FE13' },
        buttonBorder: { type: String, default: 'border-none' },
        spacing: { type: String, default: 'normal' },
        shadow: { type: String, default: 'shadow-none' },
        adsImageUrl: { type: String, default: null },
      },
    },
  },
  { timestamps: true }
);

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

sellerSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const Seller = models.Seller || model<ISeller>('Seller', sellerSchema);
