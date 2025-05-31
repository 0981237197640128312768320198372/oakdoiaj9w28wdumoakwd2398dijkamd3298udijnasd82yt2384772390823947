import { Schema, model, type Document, models } from 'mongoose';
import bcrypt from 'bcrypt';

interface IContact {
  facebook?: string;
  line?: string;
  instagram?: string;
  whatsapp?: string;
}

interface IBuyer extends Document {
  name: string;
  username?: string;
  email: string;
  password?: string;
  personalKey?: string;
  avatarUrl?: string;
  contact: IContact;
  balance: number;
  storeId: Schema.Types.ObjectId;
  activities: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  validatePersonalKey(candidateKey: string): boolean;
}

const buyerSchema = new Schema<IBuyer>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
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
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
    },
    personalKey: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: (v: string) => {
          return /^[a-zA-Z0-9]{10}$/.test(v);
        },
        message: 'Personal key must be exactly 10 alphanumeric characters',
      },
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    contact: {
      facebook: { type: String, default: null },
      line: { type: String, default: null },
      instagram: { type: String, default: null },
      whatsapp: { type: String, default: null },
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Activity',
    },
    activities: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Activity',
      },
    ],
  },
  { timestamps: true }
);

buyerSchema.pre('save', function (next) {
  if ((!this.username || !this.password) && !this.personalKey) {
    const error = new Error('Either username+password or personalKey must be provided');
    return next(error);
  }
  next();
});

buyerSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      console.log(error);
    }
  }
  next();
});

buyerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

buyerSchema.methods.validatePersonalKey = function (candidateKey: string): boolean {
  return this.personalKey === candidateKey;
};

// Virtual to get recent activities
buyerSchema.virtual('recentActivities', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'actors.primary.id',
  options: { sort: { createdAt: -1 }, limit: 10 },
});

// Virtual to get financial activities (transactions)
buyerSchema.virtual('transactions', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'actors.primary.id',
  match: { category: 'financial' },
  options: { sort: { createdAt: -1 } },
});

// Virtual to get seller interactions
buyerSchema.virtual('sellerInteractions', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'actors.primary.id',
  match: { category: 'interaction' },
  options: { sort: { createdAt: -1 } },
});

export const Buyer = models.Buyer || model<IBuyer>('Buyer', buyerSchema);
