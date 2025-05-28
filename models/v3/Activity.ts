/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, type Document, models, type Model } from 'mongoose';

interface IActivity extends Document {
  type: string;
  category: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';

  actors: {
    primary: {
      id: Schema.Types.ObjectId;
      type: 'buyer' | 'seller' | 'system' | 'admin';
      name?: string;
    };
    secondary?: {
      id: Schema.Types.ObjectId;
      type: 'buyer' | 'seller' | 'system' | 'admin';
      name?: string;
    };
  };

  metadata: {
    // Financial data
    amount?: number;
    currency?: string;
    paymentMethod?: string;
    transactionId?: string;

    // Review/Rating data
    rating?: number;
    comment?: string;

    // Credit data
    creditType?: 'positive' | 'negative';
    creditValue?: number;

    // Product data
    productId?: Schema.Types.ObjectId;
    productName?: string;
    quantity?: number;
    price?: number;

    orderId?: Schema.Types.ObjectId;
    orderNumber?: string;

    messageContent?: string;
    messageType?: string;

    ipAddress?: string;
    userAgent?: string;
    location?: {
      country?: string;
      city?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };

    [key: string]: any;
  };

  references?: {
    order?: Schema.Types.ObjectId;
    product?: Schema.Types.ObjectId;
    store?: Schema.Types.ObjectId;
    transaction?: Schema.Types.ObjectId;
    review?: Schema.Types.ObjectId;
    [key: string]: Schema.Types.ObjectId | undefined;
  };

  visibility: 'public' | 'private' | 'restricted';

  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

interface IActivityModel extends Model<IActivity> {
  createTransaction(data: {
    buyerId: Schema.Types.ObjectId;
    sellerId?: Schema.Types.ObjectId;
    amount: number;
    type: 'purchase' | 'deposit' | 'withdrawal' | 'refund';
    description: string;
    reference?: string;
  }): Promise<IActivity>;

  createReview(data: {
    buyerId: Schema.Types.ObjectId;
    sellerId: Schema.Types.ObjectId;
    rating: number;
    comment?: string;
    orderId?: Schema.Types.ObjectId;
  }): Promise<IActivity>;

  createCredit(data: {
    buyerId: Schema.Types.ObjectId;
    sellerId: Schema.Types.ObjectId;
    type: 'positive' | 'negative';
    value: number;
    reason?: string;
  }): Promise<IActivity>;
}

const activitySchema = new Schema<IActivity>(
  {
    type: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'processing'],
      default: 'pending',
      index: true,
    },
    actors: {
      primary: {
        id: {
          type: Schema.Types.ObjectId,
          required: true,
          index: true,
        },
        type: {
          type: String,
          enum: ['buyer', 'seller', 'system', 'admin'],
          required: true,
        },
        name: String,
      },
      secondary: {
        id: {
          type: Schema.Types.ObjectId,
          index: true,
        },
        type: {
          type: String,
          enum: ['buyer', 'seller', 'system', 'admin'],
        },
        name: String,
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    references: {
      type: Map,
      of: Schema.Types.ObjectId,
      default: {},
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'private',
    },
    completedAt: Date,
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    notes: String,
  },
  {
    timestamps: true,
    strict: false,
  }
);

activitySchema.index({ 'actors.primary.id': 1, createdAt: -1 });
activitySchema.index({ 'actors.secondary.id': 1, createdAt: -1 });
activitySchema.index({ type: 1, category: 1, status: 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ tags: 1 });

activitySchema.virtual('description').get(function () {
  const descriptions: { [key: string]: string } = {
    transaction: `Transaction of ${this.metadata.amount} ${this.metadata.currency || 'THB'}`,
    review: `Review with rating ${this.metadata.rating}/5`,
    credit: `${this.metadata.creditType} credit: ${this.metadata.creditValue}`,
    purchase: `Purchase of ${this.metadata.productName}`,
    deposit: `Deposit of ${this.metadata.amount} ${this.metadata.currency || 'THB'}`,
    withdrawal: `Withdrawal of ${this.metadata.amount} ${this.metadata.currency || 'THB'}`,
    login: `Login from ${this.metadata.ipAddress}`,
    message: `Message sent`,
  };

  return descriptions[this.type] || `${this.type} activity`;
});

activitySchema.statics.createTransaction = function (data: {
  buyerId: Schema.Types.ObjectId;
  sellerId?: Schema.Types.ObjectId;
  amount: number;
  type: 'purchase' | 'deposit' | 'withdrawal' | 'refund';
  description: string;
  reference?: string;
}) {
  return this.create({
    type: data.type,
    category: 'financial',
    actors: {
      primary: {
        id: data.buyerId,
        type: 'buyer',
      },
      secondary: data.sellerId
        ? {
            id: data.sellerId,
            type: 'seller',
          }
        : undefined,
    },
    metadata: {
      amount: data.amount,
      currency: 'THB',
      description: data.description,
      transactionId: data.reference,
    },
    status: 'pending',
  });
};

activitySchema.statics.createReview = function (data: {
  buyerId: Schema.Types.ObjectId;
  sellerId: Schema.Types.ObjectId;
  rating: number;
  comment?: string;
  orderId?: Schema.Types.ObjectId;
}) {
  return this.create({
    type: 'review',
    category: 'interaction',
    actors: {
      primary: {
        id: data.buyerId,
        type: 'buyer',
      },
      secondary: {
        id: data.sellerId,
        type: 'seller',
      },
    },
    metadata: {
      rating: data.rating,
      comment: data.comment,
    },
    references: {
      order: data.orderId,
    },
    status: 'completed',
    visibility: 'public',
  });
};

activitySchema.statics.createCredit = function (data: {
  buyerId: Schema.Types.ObjectId;
  sellerId: Schema.Types.ObjectId;
  type: 'positive' | 'negative';
  value: number;
  reason?: string;
}) {
  return this.create({
    type: 'credit',
    category: 'interaction',
    actors: {
      primary: {
        id: data.buyerId,
        type: 'buyer',
      },
      secondary: {
        id: data.sellerId,
        type: 'seller',
      },
    },
    metadata: {
      creditType: data.type,
      creditValue: data.value,
      comment: data.reason,
    },
    status: 'completed',
    visibility: 'public',
  });
};

export const Activity =
  (models.Activity as IActivityModel) ||
  model<IActivity, IActivityModel>('Activity', activitySchema);
