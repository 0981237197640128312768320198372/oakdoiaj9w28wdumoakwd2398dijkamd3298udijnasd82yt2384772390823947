import { Schema, model, Document, Types, Model } from 'mongoose';

interface IOrderItem {
  productId: Types.ObjectId;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  digitalAssets: Array<{ key: string; value: string }>;
}

interface IOrderTotals {
  subtotal: number;
  discount: number;
  total: number;
}

export interface IOrder extends Document {
  orderId: string;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  items: IOrderItem[];
  totals: IOrderTotals;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'reserved' | 'paid' | 'refunded';
  deliveryStatus: 'pending' | 'processing' | 'delivered' | 'failed';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  // Metadata
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    totalQuantity: number;
  };

  // References
  transactionId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
}

interface IOrderModel extends Model<IOrder> {
  createFromCart(
    buyerId: Types.ObjectId,
    sellerId: Types.ObjectId,
    cartItems: Array<{
      productId: string;
      productTitle: string;
      quantity: number;
      price: number;
    }>,
    metadata?: Record<string, unknown>
  ): Promise<IOrder>;

  findActiveOrders(sellerId?: Types.ObjectId): Promise<IOrder[]>;
  findExpiredOrders(): Promise<IOrder[]>;
  cancelExpiredOrders(): Promise<number>;
  getBuyerOrderHistory(buyerId: Types.ObjectId, limit?: number): Promise<IOrder[]>;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    digitalAssets: [
      {
        key: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { _id: false }
);

const orderTotalsSchema = new Schema<IOrderTotals>(
  {
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'Buyer',
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    totals: {
      type: orderTotalsSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'reserved', 'paid', 'refunded'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'processing', 'delivered', 'failed'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    confirmedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    metadata: {
      ipAddress: String,
      userAgent: String,
      totalQuantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ expiresAt: 1, status: 1 });
OrderSchema.index({ buyerId: 1, createdAt: -1 });
OrderSchema.index({ sellerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to generate orderId
OrderSchema.pre('save', function (next) {
  if (this.isNew && !this.orderId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    this.orderId = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Static method to create order from cart
OrderSchema.statics.createFromCart = async function (
  buyerId: Types.ObjectId,
  sellerId: Types.ObjectId,
  cartItems: Array<{
    productId: string;
    productTitle: string;
    quantity: number;
    price: number;
  }>,
  metadata: Record<string, unknown> = {}
) {
  // Calculate totals
  let subtotal = 0;
  let totalQuantity = 0;

  const orderItems: IOrderItem[] = cartItems.map((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    totalQuantity += item.quantity;

    return {
      productId: new Types.ObjectId(item.productId),
      productTitle: item.productTitle,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: itemTotal,
      digitalAssets: [],
    };
  });

  const totals: IOrderTotals = {
    subtotal,
    discount: 0,
    total: subtotal,
  };

  // Set expiration to 2 minutes from now
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  return this.create({
    buyerId,
    sellerId,
    items: orderItems,
    totals,
    expiresAt,
    metadata: {
      ...metadata,
      totalQuantity,
    },
  });
};

// Static method to find active orders
OrderSchema.statics.findActiveOrders = async function (sellerId?: Types.ObjectId) {
  const query: Record<string, unknown> = {
    status: { $in: ['pending', 'completed'] },
  };

  if (sellerId) {
    query.sellerId = sellerId;
  }

  return this.find(query)
    .populate('buyerId', 'username email')
    .populate('sellerId', 'username store.name')
    .sort({ createdAt: -1 });
};

// Static method to find expired orders
OrderSchema.statics.findExpiredOrders = async function () {
  return this.find({
    status: 'pending',
    expiresAt: { $lt: new Date() },
  });
};

// Static method to cancel expired orders
OrderSchema.statics.cancelExpiredOrders = async function () {
  const result = await this.updateMany(
    {
      status: 'pending',
      expiresAt: { $lt: new Date() },
    },
    {
      $set: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    }
  );

  return result.modifiedCount;
};

// Static method to get buyer order history
OrderSchema.statics.getBuyerOrderHistory = async function (
  buyerId: Types.ObjectId,
  limit: number = 20
) {
  return this.find({ buyerId })
    .populate('sellerId', 'username store.name store.logoUrl')
    .sort({ createdAt: -1 })
    .limit(limit);
};

export const Order = model<IOrder, IOrderModel>('Order', OrderSchema);
