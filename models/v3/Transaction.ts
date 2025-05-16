import { Schema, model, Document, Types } from 'mongoose';

interface ITransaction extends Document {
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  productId: Types.ObjectId;
  amount: number;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Transaction = model<ITransaction>('Transaction', transactionSchema);
