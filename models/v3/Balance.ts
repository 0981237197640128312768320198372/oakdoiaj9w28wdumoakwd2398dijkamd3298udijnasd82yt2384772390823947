import { Schema, model, Document } from 'mongoose';

interface IBalance extends Document {
  buyerId?: string;
  sellerId?: string;
  balanceType: 'wallet' | 'earnings';
  amount: number;
  lastUpdated: Date;
}

const balanceSchema = new Schema<IBalance>({
  buyerId: { type: Schema.Types.ObjectId, ref: 'User' },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller' },
  balanceType: { type: String, enum: ['wallet', 'earnings'], required: true },
  amount: { type: Number, required: true, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

// Validation to ensure correct ID is set based on balanceType
balanceSchema.pre('save', function (next) {
  if (this.balanceType === 'wallet') {
    if (!this.buyerId) {
      next(new Error('buyerId is required for wallet balance'));
    }
    if (this.sellerId) {
      next(new Error('sellerId should not be set for wallet balance'));
    }
  } else if (this.balanceType === 'earnings') {
    if (!this.sellerId) {
      next(new Error('sellerId is required for earnings balance'));
    }
    if (this.buyerId) {
      next(new Error('buyerId should not be set for earnings balance'));
    }
  }
  next();
});

export const Balance = model<IBalance>('Balance', balanceSchema);
