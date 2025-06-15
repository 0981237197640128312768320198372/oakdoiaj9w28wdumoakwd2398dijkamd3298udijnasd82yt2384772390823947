import { Schema, model, Document, Types, Model } from 'mongoose';

export interface IStoreCredit extends Document {
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  creditType: 'positive' | 'negative';
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreCreditModel extends Model<IStoreCredit> {
  getCreditStats(sellerId: Types.ObjectId): Promise<{
    positiveCount: number;
    negativeCount: number;
    totalCount: number;
    positivePercentage: number;
  }>;
  getUserCredit(buyerId: Types.ObjectId, sellerId: Types.ObjectId): Promise<IStoreCredit | null>;
}

const storeCreditSchema = new Schema<IStoreCredit>(
  {
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
    creditType: {
      type: String,
      enum: ['positive', 'negative'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one credit per buyer per seller
storeCreditSchema.index({ buyerId: 1, sellerId: 1 }, { unique: true });

// Compound index for efficient queries
storeCreditSchema.index({ sellerId: 1, creditType: 1, createdAt: -1 });

// Static methods
storeCreditSchema.statics.getCreditStats = async function (sellerId: Types.ObjectId) {
  const result = await this.aggregate([
    { $match: { sellerId } },
    {
      $group: {
        _id: '$creditType',
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = {
    positiveCount: 0,
    negativeCount: 0,
    totalCount: 0,
    positivePercentage: 0,
  };

  result.forEach((item) => {
    if (item._id === 'positive') {
      stats.positiveCount = item.count;
    } else if (item._id === 'negative') {
      stats.negativeCount = item.count;
    }
  });

  stats.totalCount = stats.positiveCount + stats.negativeCount;
  stats.positivePercentage =
    stats.totalCount > 0 ? Math.round((stats.positiveCount / stats.totalCount) * 100) : 0;

  return stats;
};

storeCreditSchema.statics.getUserCredit = async function (
  buyerId: Types.ObjectId,
  sellerId: Types.ObjectId
) {
  return this.findOne({ buyerId, sellerId });
};

export const StoreCredit = model<IStoreCredit, IStoreCreditModel>('StoreCredit', storeCreditSchema);
