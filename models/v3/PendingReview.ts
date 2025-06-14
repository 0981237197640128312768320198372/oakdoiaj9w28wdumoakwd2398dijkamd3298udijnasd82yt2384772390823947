import { Schema, model, Document, Types, Model } from 'mongoose';
import { IOrder } from './Order';

export interface IPendingReview extends Document {
  orderId: Types.ObjectId;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  productId: Types.ObjectId;
  productTitle: string;
  orderTotal: number;
  createdAt: Date;
  reminderCount: number;
  lastRemindedAt?: Date;
  expiresAt: Date;
}

export interface IPendingReviewModel extends Model<IPendingReview> {
  createFromOrder(order: IOrder): Promise<IPendingReview[]>;
  findPendingForBuyer(buyerId: Types.ObjectId): Promise<IPendingReview[]>;
  incrementReminder(pendingReviewId: Types.ObjectId): Promise<IPendingReview | null>;
}

const pendingReviewSchema = new Schema<IPendingReview>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
    },
    orderTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    reminderCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRemindedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
pendingReviewSchema.index({ buyerId: 1, createdAt: -1 });
pendingReviewSchema.index({ expiresAt: 1, buyerId: 1 });
pendingReviewSchema.index({ orderId: 1, buyerId: 1 }, { unique: true });

// TTL index to automatically remove expired pending reviews
pendingReviewSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static methods
pendingReviewSchema.statics.createFromOrder = async function (order: IOrder) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const pendingReviews = order.items.map((item) => ({
    orderId: order._id,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    productId: item.productId,
    productTitle: item.productTitle,
    orderTotal: order.totals.total,
    expiresAt,
  }));

  return this.insertMany(pendingReviews, { ordered: false });
};

pendingReviewSchema.statics.findPendingForBuyer = async function (buyerId: Types.ObjectId) {
  return this.find({
    buyerId,
    expiresAt: { $gt: new Date() },
  })
    .populate('sellerId', 'store.name store.logoUrl')
    .sort({ createdAt: -1 });
};

pendingReviewSchema.statics.incrementReminder = async function (pendingReviewId: Types.ObjectId) {
  return this.findByIdAndUpdate(
    pendingReviewId,
    {
      $inc: { reminderCount: 1 },
      $set: { lastRemindedAt: new Date() },
    },
    { new: true }
  );
};

export const PendingReview = model<IPendingReview, IPendingReviewModel>(
  'PendingReview',
  pendingReviewSchema
);
