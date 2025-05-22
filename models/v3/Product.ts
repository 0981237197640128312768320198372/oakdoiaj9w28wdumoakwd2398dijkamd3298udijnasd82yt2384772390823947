/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Document, Types } from 'mongoose';

interface IProductDetails {
  [key: string]: any;
}

interface IProduct extends Document {
  title: string;
  description: string;
  stock: number;
  details: IProductDetails;
  sellerId: Types.ObjectId;
  categoryId: Types.ObjectId;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
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
  details: Schema.Types.Mixed,
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  discountedPrice: { type: Number, default: 0 },
  images: [String],
  status: { type: String, enum: ['active', 'draft'], default: 'draft' },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

productSchema.pre('save', function (next) {
  if (this.discountPercentage > 0) {
    this.discountedPrice = this.price * (1 - this.discountPercentage / 100);
  } else {
    this.discountedPrice = this.price;
  }
  next();
});

export const Product = model<IProduct>('Product', productSchema);
