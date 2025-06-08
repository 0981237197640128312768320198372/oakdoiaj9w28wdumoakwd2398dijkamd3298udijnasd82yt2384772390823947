import { Schema, model, Document, models, Types } from 'mongoose';

export interface IPayment extends Document {
  paymentIntentId: string;
  buyerId: Types.ObjectId;
  amount: number;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  currency: string;
  paymentMethod: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'Buyer',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [10, 'Minimum amount is 10'],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled'],
      default: 'pending',
      required: true,
      index: true,
    },
    currency: {
      type: String,
      default: 'THB',
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'promptpay',
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = models.Payment || model<IPayment>('Payment', paymentSchema);
