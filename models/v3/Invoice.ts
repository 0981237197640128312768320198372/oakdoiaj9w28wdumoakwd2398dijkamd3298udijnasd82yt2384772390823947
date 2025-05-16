import { Schema, model, Document, Types } from 'mongoose';

interface IInvoice extends Document {
  invoiceId: Types.ObjectId; // Unique identifier for the invoice
  pin: string; // Secret PIN to secure access
  productId: Types.ObjectId; // Reference to the purchased product
  buyerEmail: string; // Email for buyer communication
  status?: 'pending' | 'completed' | 'cancelled'; // Tracks purchase status
  createdAt: Date; // When the invoice was created
  expiresAt?: Date; // Optional expiration for added security
}

const invoiceSchema = new Schema<IInvoice>({
  invoiceId: { type: Schema.Types.ObjectId, required: true, unique: true },
  pin: { type: String, required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  buyerEmail: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Optional: Expires after a set time
});

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);
