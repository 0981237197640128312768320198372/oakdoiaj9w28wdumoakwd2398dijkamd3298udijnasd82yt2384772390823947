import { Schema, model, Document, Types } from 'mongoose';

interface IStoreCredit extends Document {
  storeId: Types.ObjectId;
  buyerId: Types.ObjectId;
  creditType: 'positive' | 'negative';
  createdAt: Date;
}

const storeCreditSchema = new Schema<IStoreCredit>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  creditType: { type: String, enum: ['positive', 'negative'], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure one credit per buyer per store
storeCreditSchema.index({ storeId: 1, buyerId: 1 }, { unique: true });

export const StoreCredit = model<IStoreCredit>('StoreCredit', storeCreditSchema);
