/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Document, Types } from 'mongoose';

interface IProductDetails {
  [key: string]: any;
}

interface IProduct extends Document {
  title: string;
  description: string;
  stock: number;
  type: string;
  details: IProductDetails;
  sellerId: Types.ObjectId;
  categoryId: Types.ObjectId;
  price: number;
  images: string[];
  status: 'active' | 'draft';
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  stock: { type: Number, required: true },
  type: { type: String, required: true },
  details: Schema.Types.Mixed,
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  images: [String],
  status: { type: String, enum: ['active', 'draft'], default: 'draft' },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Product = model<IProduct>('Product', productSchema);
