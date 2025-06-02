/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Document, Types, models } from 'mongoose';

interface IProduct extends Document {
  title: string;
  description: string;
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
  _stock?: number;
  digitalInventoryId?: Types.ObjectId;
}

const productSchema = new Schema<IProduct>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  discountedPrice: { type: Number, default: 0 },
  images: [String],
  status: { type: String, enum: ['active', 'draft'], default: 'active' },
  rating: { type: Number, default: 0 },
  _stock: { type: Number, default: 0 },
  digitalInventoryId: { type: Schema.Types.ObjectId, ref: 'DigitalInventory' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

productSchema.virtual('productDataId').get(function () {
  return this.digitalInventoryId;
});

productSchema.virtual('productDataId').set(function (value) {
  this.digitalInventoryId = value;
});

productSchema.pre('save', function (next) {
  if (this.discountPercentage > 0) {
    this.discountedPrice = this.price * (1 - this.discountPercentage / 100);
  } else {
    this.discountedPrice = this.price;
  }
  next();
});

productSchema.virtual('stock').get(function () {
  return this._stock || 0;
});

productSchema.statics.calculateStock = async function (productId) {
  const DigitalInventory = models.ProductData;
  if (!DigitalInventory) return 0;

  const variants = await DigitalInventory.find({ productId });

  let totalItems = 0;
  variants.forEach((variant) => {
    const assets = variant.digitalAssets || variant.specifications;

    if (Array.isArray(assets)) {
      totalItems += assets.length;
    } else {
      totalItems += 1;
    }
  });

  return totalItems;
};

export const Product = models.Product || model<IProduct>('Product', productSchema);
