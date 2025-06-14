import { Schema, model, Document, Types, Model } from 'mongoose';
import { roundToTwo, safeAdd, safeSubtract } from '@/lib/utils';

interface IBalance extends Document {
  buyerId?: Types.ObjectId;
  sellerId?: Types.ObjectId;
  balanceType: 'wallet' | 'earnings' | 'escrow' | 'pending' | 'reserved';
  amount: number;
  lastUpdated: Date;
  status: 'active' | 'frozen' | 'suspended';
}

interface IBalanceModel extends Model<IBalance> {
  findOrCreateBalance(
    userId: Types.ObjectId,
    userType: 'buyer' | 'seller',
    balanceType?: 'wallet' | 'earnings' | 'escrow' | 'pending' | 'reserved'
  ): Promise<IBalance>;

  updateBalance(
    userId: Types.ObjectId,
    userType: 'buyer' | 'seller',
    amount: number,
    balanceType?: 'wallet' | 'earnings' | 'escrow' | 'pending' | 'reserved',
    operation?: 'add' | 'subtract'
  ): Promise<IBalance>;
}

const balanceSchema = new Schema<IBalance>({
  buyerId: { type: Schema.Types.ObjectId, ref: 'Buyer' },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller' },
  balanceType: {
    type: String,
    enum: ['wallet', 'earnings', 'escrow', 'pending', 'reserved'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Balance cannot be negative'],
  },
  lastUpdated: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['active', 'frozen', 'suspended'],
    default: 'active',
  },
});

balanceSchema.pre('save', function (next) {
  // Round amount to 2 decimal places to prevent floating-point precision issues
  if (this.isModified('amount')) {
    this.amount = roundToTwo(this.amount);
  }

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

// Static methods for balance operations
balanceSchema.statics.findOrCreateBalance = async function (
  userId: Types.ObjectId,
  userType: 'buyer' | 'seller',
  balanceType: 'wallet' | 'earnings' | 'escrow' | 'pending' | 'reserved' = userType === 'buyer'
    ? 'wallet'
    : 'earnings'
) {
  const query =
    userType === 'buyer' ? { buyerId: userId, balanceType } : { sellerId: userId, balanceType };

  let balance = await this.findOne(query);

  if (!balance) {
    balance = await this.create({
      ...query,
      amount: 0,
      status: 'active',
    });
  }

  return balance;
};

balanceSchema.statics.updateBalance = async function (
  userId: Types.ObjectId,
  userType: 'buyer' | 'seller',
  amount: number,
  balanceType: 'wallet' | 'earnings' | 'escrow' | 'pending' | 'reserved' = userType === 'buyer'
    ? 'wallet'
    : 'earnings',
  operation: 'add' | 'subtract' = 'add'
) {
  const query =
    userType === 'buyer' ? { buyerId: userId, balanceType } : { sellerId: userId, balanceType };

  const balance = await this.findOne(query);

  if (!balance) {
    throw new Error(`Balance not found for ${userType} ${userId}`);
  }

  if (balance.status !== 'active') {
    throw new Error(`Balance is ${balance.status} and cannot be modified`);
  }

  if (operation === 'subtract' && balance.amount < amount) {
    throw new Error('Insufficient balance');
  }

  const newAmount =
    operation === 'add' ? safeAdd(balance.amount, amount) : safeSubtract(balance.amount, amount);

  return this.findOneAndUpdate(
    query,
    {
      $set: {
        amount: newAmount,
        lastUpdated: new Date(),
      },
    },
    { new: true }
  );
};

export const Balance = model<IBalance, IBalanceModel>('Balance', balanceSchema);
