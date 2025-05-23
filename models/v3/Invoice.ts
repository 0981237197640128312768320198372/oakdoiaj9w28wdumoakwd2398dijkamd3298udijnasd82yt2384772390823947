import { Schema, model, Document, Types } from 'mongoose';

interface IInvoice extends Document {
  invoiceId: Types.ObjectId;
  pin: string;
  productId: Types.ObjectId;
  buyerEmail: string;
  status?: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  expiresAt?: Date;
}

const invoiceSchema = new Schema<IInvoice>({
  invoiceId: { type: Schema.Types.ObjectId, required: true, unique: true },
  pin: { type: String, required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  buyerEmail: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);
