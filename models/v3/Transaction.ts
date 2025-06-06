import { Schema, model, Document, Types, Model } from 'mongoose';

interface IStatusHistory {
  status: string;
  timestamp: Date;
  reason?: string;
  performedBy?: Types.ObjectId;
}

interface IFees {
  platform: number;
  payment: number;
  tax: number;
}

interface IGeolocation {
  country?: string;
  city?: string;
  coordinates?: [number, number];
}

interface IReferences {
  order?: Types.ObjectId;
  product?: Types.ObjectId;
  invoice?: Types.ObjectId;
  activity?: Types.ObjectId;
}

export interface ITransaction extends Document {
  transactionId: string;
  relatedTransactions: string[];

  // Participants
  sourceId?: Types.ObjectId;
  sourceType: 'buyer' | 'seller' | 'system' | 'external';
  destinationId?: Types.ObjectId;
  destinationType: 'buyer' | 'seller' | 'system' | 'external';

  // Financial details
  amount: number;
  currency: string;
  exchangeRate?: number;
  fees: IFees;
  netAmount: number;

  // Classification
  type:
    | 'deposit'
    | 'withdrawal'
    | 'purchase'
    | 'refund'
    | 'transfer'
    | 'adjustment'
    | 'chargeback'
    | 'fee'
    | 'reward';
  category: 'payment' | 'internal' | 'external' | 'system';

  // Payment details
  paymentMethod?: string;
  paymentReference?: string;
  paymentProvider?: string;

  // Status tracking
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'disputed'
    | 'refunded'
    | 'partially_refunded';
  statusHistory: IStatusHistory[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Additional data
  metadata: Record<string, unknown>;
  notes?: string;
  tags?: string[];

  // References to related entities
  references: IReferences;

  // Security and compliance
  ipAddress?: string;
  userAgent?: string;
  geolocation?: IGeolocation;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  riskScore?: number;
}

interface ITransactionModel extends Model<ITransaction> {
  createDepositTransaction(
    buyerId: Types.ObjectId,
    amount: number,
    paymentMethod: string,
    paymentReference: string,
    metadata?: Record<string, unknown>
  ): Promise<ITransaction>;

  updateTransactionStatus(
    transactionId: string,
    status:
      | 'pending'
      | 'processing'
      | 'completed'
      | 'failed'
      | 'cancelled'
      | 'disputed'
      | 'refunded'
      | 'partially_refunded',
    reason?: string,
    performedBy?: Types.ObjectId
  ): Promise<ITransaction>;
}

const statusHistorySchema = new Schema<IStatusHistory>({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  reason: String,
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

const feesSchema = new Schema<IFees>(
  {
    platform: { type: Number, default: 0 },
    payment: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
  },
  { _id: false }
);

const geolocationSchema = new Schema<IGeolocation>(
  {
    country: String,
    city: String,
    coordinates: {
      type: [Number],
      validate: {
        validator: function (v: number[]) {
          return v.length === 2;
        },
        message: 'Coordinates must be [longitude, latitude]',
      },
    },
  },
  { _id: false }
);

const referencesSchema = new Schema<IReferences>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    activity: { type: Schema.Types.ObjectId, ref: 'Activity' },
  },
  { _id: false }
);

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    relatedTransactions: [String],

    // Participants
    sourceId: { type: Schema.Types.ObjectId, refPath: 'sourceType' },
    sourceType: {
      type: String,
      enum: ['buyer', 'seller', 'system', 'external'],
      required: true,
    },
    destinationId: { type: Schema.Types.ObjectId, refPath: 'destinationType' },
    destinationType: {
      type: String,
      enum: ['buyer', 'seller', 'system', 'external'],
      required: true,
    },

    // Financial details
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be positive'],
    },
    currency: {
      type: String,
      required: true,
      default: 'THB',
    },
    exchangeRate: Number,
    fees: {
      type: feesSchema,
      default: () => ({
        platform: 0,
        payment: 0,
        tax: 0,
      }),
    },
    netAmount: {
      type: Number,
      required: true,
    },

    // Classification
    type: {
      type: String,
      enum: [
        'deposit',
        'withdrawal',
        'purchase',
        'refund',
        'transfer',
        'adjustment',
        'chargeback',
        'fee',
        'reward',
      ],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['payment', 'internal', 'external', 'system'],
      required: true,
      index: true,
    },

    // Payment details
    paymentMethod: String,
    paymentReference: String,
    paymentProvider: String,

    // Status tracking
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'completed',
        'failed',
        'cancelled',
        'disputed',
        'refunded',
        'partially_refunded',
      ],
      required: true,
      default: 'pending',
      index: true,
    },
    statusHistory: [statusHistorySchema],

    // Additional data
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    notes: String,
    tags: [String],

    // References to related entities
    references: {
      type: referencesSchema,
      default: {},
    },

    // Security and compliance
    ipAddress: String,
    userAgent: String,
    geolocation: geolocationSchema,
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
TransactionSchema.index({ sourceId: 1, sourceType: 1 });
TransactionSchema.index({ destinationId: 1, destinationType: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ status: 1, type: 1 });
TransactionSchema.index({ 'references.order': 1 });
TransactionSchema.index({ 'references.activity': 1 });

// Pre-save hook to calculate netAmount if not provided
TransactionSchema.pre('save', function (next) {
  const doc = this as unknown as ITransaction;

  if (this.isModified('amount') || this.isModified('fees')) {
    const totalFees = doc.fees.platform + doc.fees.payment + doc.fees.tax;
    doc.netAmount = doc.amount - totalFees;
  }

  // Add status change to history if status changed
  if (this.isModified('status')) {
    if (!doc.statusHistory) {
      doc.statusHistory = [];
    }

    doc.statusHistory.push({
      status: doc.status,
      timestamp: new Date(),
    });
  }

  next();
});

// Static method to create a deposit transaction
TransactionSchema.statics.createDepositTransaction = async function (
  buyerId: Types.ObjectId,
  amount: number,
  paymentMethod: string,
  paymentReference: string,
  metadata: Record<string, unknown> = {}
) {
  const transactionId = `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Calculate fees based on payment method
  const platformFee = 0;
  let paymentFee = 0;

  if (paymentMethod === 'stripe') {
    // Stripe typically charges 2.9% + 30 cents
    paymentFee = Math.round(amount * 0.029 + 30);
  }

  const netAmount = amount - platformFee - paymentFee;

  return this.create({
    transactionId,
    sourceType: 'external',
    destinationType: 'buyer',
    destinationId: buyerId,
    amount,
    currency: 'THB',
    fees: {
      platform: platformFee,
      payment: paymentFee,
      tax: 0,
    },
    netAmount,
    type: 'deposit',
    category: 'payment',
    paymentMethod,
    paymentReference,
    paymentProvider: 'stripe',
    status: 'pending',
    metadata: {
      ...metadata,
      dokmaiCoins: amount, // 1 THB = 1 Dokmai Coin
    },
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(),
      },
    ],
  });
};

// Static method to update transaction status
TransactionSchema.statics.updateTransactionStatus = async function (
  transactionId: string,
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'disputed'
    | 'refunded'
    | 'partially_refunded',
  reason?: string,
  performedBy?: Types.ObjectId
) {
  const transaction = await this.findOne({ transactionId });

  if (!transaction) {
    throw new Error(`Transaction ${transactionId} not found`);
  }

  const update: { status: string; completedAt?: Date } = { status };

  if (status === 'completed' && !transaction.completedAt) {
    update.completedAt = new Date();
  }

  const statusHistoryEntry = {
    status,
    timestamp: new Date(),
    reason,
    performedBy,
  };

  return this.findOneAndUpdate(
    { transactionId },
    {
      $set: update,
      $push: { statusHistory: statusHistoryEntry },
    },
    { new: true }
  );
};

export const Transaction = model<ITransaction, ITransactionModel>('Transaction', TransactionSchema);
