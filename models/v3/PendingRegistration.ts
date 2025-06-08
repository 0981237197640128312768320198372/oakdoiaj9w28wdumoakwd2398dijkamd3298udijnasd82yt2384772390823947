import { Schema, model, type Document, models } from 'mongoose';

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
  theme?: Record<string, unknown>; // Will be processed when creating actual seller
}

interface IVerification {
  code: string;
  expiresAt: Date;
  attempts: number;
}

interface IPendingRegistration extends Document {
  username: string;
  email: string;
  password: string; // Hashed
  contact: IContact;
  store: IStore;
  verification: IVerification;
  lineUserId?: string;
  createdAt: Date;
  expiresAt: Date;
}

const pendingRegistrationSchema = new Schema<IPendingRegistration>(
  {
    username: {
      type: String,
      required: true,
      index: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: true,
      index: true,
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
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
      theme: { type: Schema.Types.Mixed, default: {} },
    },
    verification: {
      code: {
        type: String,
        required: true,
        index: true,
      },
      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },
      attempts: {
        type: Number,
        default: 0,
        max: [3, 'Maximum verification attempts exceeded'],
      },
    },
    lineUserId: {
      type: String,
      default: null,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index for automatic cleanup
    },
  },
  {
    timestamps: true,
    collection: 'pending_registrations',
  }
);

// Compound indexes for efficient queries
pendingRegistrationSchema.index({ 'verification.code': 1, 'verification.expiresAt': 1 });
pendingRegistrationSchema.index({ email: 1, username: 1 });

export const PendingRegistration =
  models.PendingRegistration ||
  model<IPendingRegistration>('PendingRegistration', pendingRegistrationSchema);
