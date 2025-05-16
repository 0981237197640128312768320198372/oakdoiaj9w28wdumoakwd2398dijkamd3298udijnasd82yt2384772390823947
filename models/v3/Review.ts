import { Schema, model, Document, Types } from 'mongoose';

interface IReview extends Document {
  productId: Types.ObjectId;
  sellerId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Review = model<IReview>('Review', reviewSchema);
