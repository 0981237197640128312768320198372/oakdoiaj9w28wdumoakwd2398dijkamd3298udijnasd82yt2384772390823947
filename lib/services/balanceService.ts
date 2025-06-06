import { Types } from 'mongoose';
import { Balance } from '@/models/v3/Balance';
import { Transaction } from '@/models/v3/Transaction';
import { Activity } from '@/models/v3/Activity';

/**
 * Service for handling balance operations
 */
export class BalanceService {
  /**
   * Get a user's balance, creating it if it doesn't exist
   */
  static async getBalance(
    userId: string | Types.ObjectId,
    userType: 'buyer' | 'seller',
    balanceType: 'wallet' | 'earnings' | 'escrow' | 'pending' | 'reserved' = userType === 'buyer'
      ? 'wallet'
      : 'earnings'
  ) {
    const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return Balance.findOrCreateBalance(userIdObj, userType, balanceType);
  }

  /**
   * Add funds to a user's balance
   */
  static async addFunds(
    userId: string | Types.ObjectId,
    userType: 'buyer' | 'seller',
    amount: number,
    balanceType: 'wallet' | 'earnings' | 'escrow' | 'pending' | 'reserved' = userType === 'buyer'
      ? 'wallet'
      : 'earnings',
    transactionType: 'deposit' | 'transfer' | 'refund' | 'adjustment' | 'reward' = 'deposit',
    metadata: Record<string, unknown> = {}
  ) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    // Update balance
    const updatedBalance = await Balance.updateBalance(
      userIdObj,
      userType,
      amount,
      balanceType,
      'add'
    );

    if (!updatedBalance) {
      throw new Error(`Failed to update ${userType} balance`);
    }

    // Create transaction record
    const transaction = await Transaction.create({
      transactionId: `${transactionType.toUpperCase()}-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`,
      sourceType: 'external',
      destinationType: userType,
      destinationId: userIdObj,
      amount,
      currency: 'THB',
      fees: {
        platform: 0,
        payment: 0,
        tax: 0,
      },
      netAmount: amount,
      type: transactionType,
      category: 'payment',
      status: 'completed',
      metadata: {
        ...metadata,
        dokmaiCoins: amount, // 1 THB = 1 Dokmai Coin
      },
      statusHistory: [
        {
          status: 'completed',
          timestamp: new Date(),
        },
      ],
      completedAt: new Date(),
    });

    // Create activity record
    const activityData = {
      type: transactionType,
      category: 'financial',
      status: 'completed',
      actors: {
        primary: {
          id: userIdObj,
          type: userType,
        },
      },
      metadata: {
        amount,
        currency: 'THB',
        balanceType,
        transactionId: transaction.transactionId,
      },
      completedAt: new Date(),
    };

    const activity = await Activity.create(activityData);

    return {
      balance: updatedBalance,
      transaction,
      activity,
    };
  }

  /**
   * Subtract funds from a user's balance
   */
  static async subtractFunds(
    userId: string | Types.ObjectId,
    userType: 'buyer' | 'seller',
    amount: number,
    balanceType: 'wallet' | 'earnings' | 'escrow' | 'pending' | 'reserved' = userType === 'buyer'
      ? 'wallet'
      : 'earnings',
    transactionType: 'withdrawal' | 'purchase' | 'transfer' | 'adjustment' | 'fee' = 'withdrawal',
    metadata: Record<string, unknown> = {}
  ) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    // Update balance
    const updatedBalance = await Balance.updateBalance(
      userIdObj,
      userType,
      amount,
      balanceType,
      'subtract'
    );

    if (!updatedBalance) {
      throw new Error(`Failed to update ${userType} balance`);
    }

    // Create transaction record
    const transaction = await Transaction.create({
      transactionId: `${transactionType.toUpperCase()}-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`,
      sourceType: userType,
      sourceId: userIdObj,
      destinationType: 'external',
      amount,
      currency: 'THB',
      fees: {
        platform: 0,
        payment: 0,
        tax: 0,
      },
      netAmount: amount,
      type: transactionType,
      category: 'payment',
      status: 'completed',
      metadata: {
        ...metadata,
        dokmaiCoins: amount, // 1 THB = 1 Dokmai Coin
      },
      statusHistory: [
        {
          status: 'completed',
          timestamp: new Date(),
        },
      ],
      completedAt: new Date(),
    });

    // Create activity record
    const activityData = {
      type: transactionType,
      category: 'financial',
      status: 'completed',
      actors: {
        primary: {
          id: userIdObj,
          type: userType,
        },
      },
      metadata: {
        amount,
        currency: 'THB',
        balanceType,
        transactionId: transaction.transactionId,
      },
      completedAt: new Date(),
    };

    const activity = await Activity.create(activityData);

    return {
      balance: updatedBalance,
      transaction,
      activity,
    };
  }

  /**
   * Transfer funds between users
   */
  static async transferFunds(
    sourceUserId: string | Types.ObjectId,
    sourceUserType: 'buyer' | 'seller',
    destinationUserId: string | Types.ObjectId,
    destinationUserType: 'buyer' | 'seller',
    amount: number,
    sourceBalanceType:
      | 'wallet'
      | 'earnings'
      | 'escrow'
      | 'pending'
      | 'reserved' = sourceUserType === 'buyer' ? 'wallet' : 'earnings',
    destinationBalanceType:
      | 'wallet'
      | 'earnings'
      | 'escrow'
      | 'pending'
      | 'reserved' = destinationUserType === 'buyer' ? 'wallet' : 'earnings',
    metadata: Record<string, unknown> = {}
  ) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const sourceUserIdObj =
      typeof sourceUserId === 'string' ? new Types.ObjectId(sourceUserId) : sourceUserId;
    const destinationUserIdObj =
      typeof destinationUserId === 'string'
        ? new Types.ObjectId(destinationUserId)
        : destinationUserId;

    // Subtract from source
    const sourceBalance = await Balance.updateBalance(
      sourceUserIdObj,
      sourceUserType,
      amount,
      sourceBalanceType,
      'subtract'
    );

    if (!sourceBalance) {
      throw new Error(`Failed to update source ${sourceUserType} balance`);
    }

    // Add to destination
    const destinationBalance = await Balance.updateBalance(
      destinationUserIdObj,
      destinationUserType,
      amount,
      destinationBalanceType,
      'add'
    );

    if (!destinationBalance) {
      // Rollback source balance change
      await Balance.updateBalance(
        sourceUserIdObj,
        sourceUserType,
        amount,
        sourceBalanceType,
        'add'
      );
      throw new Error(`Failed to update destination ${destinationUserType} balance`);
    }

    // Create transaction record
    const transaction = await Transaction.create({
      transactionId: `TRANSFER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sourceType: sourceUserType,
      sourceId: sourceUserIdObj,
      destinationType: destinationUserType,
      destinationId: destinationUserIdObj,
      amount,
      currency: 'THB',
      fees: {
        platform: 0,
        payment: 0,
        tax: 0,
      },
      netAmount: amount,
      type: 'transfer',
      category: 'internal',
      status: 'completed',
      metadata: {
        ...metadata,
        sourceBalanceType,
        destinationBalanceType,
        dokmaiCoins: amount, // 1 THB = 1 Dokmai Coin
      },
      statusHistory: [
        {
          status: 'completed',
          timestamp: new Date(),
        },
      ],
      completedAt: new Date(),
    });

    // Create activity record
    const activity = await Activity.create({
      type: 'transfer',
      category: 'financial',
      status: 'completed',
      actors: {
        primary: {
          id: sourceUserIdObj,
          type: sourceUserType,
        },
        secondary: {
          id: destinationUserIdObj,
          type: destinationUserType,
        },
      },
      metadata: {
        amount,
        currency: 'THB',
        sourceBalanceType,
        destinationBalanceType,
        transactionId: transaction.transactionId,
      },
      completedAt: new Date(),
    });

    return {
      sourceBalance,
      destinationBalance,
      transaction,
      activity,
    };
  }

  /**
   * Get transaction history for a user
   */
  static async getTransactionHistory(
    userId: string | Types.ObjectId,
    userType: 'buyer' | 'seller',
    options: {
      limit?: number;
      skip?: number;
      type?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const { limit = 10, skip = 0, type, status, startDate, endDate } = options;

    interface QueryType {
      $or: Array<Record<string, unknown>>;
      type?: string;
      status?: string;
      createdAt?: {
        $gte?: Date;
        $lte?: Date;
      };
    }

    const query: QueryType = {
      $or: [],
    };

    // Add user ID to query based on user type
    if (userType === 'buyer') {
      query.$or = [
        { sourceId: userIdObj, sourceType: 'buyer' },
        { destinationId: userIdObj, destinationType: 'buyer' },
      ];
    } else {
      query.$or = [
        { sourceId: userIdObj, sourceType: 'seller' },
        { destinationId: userIdObj, destinationType: 'seller' },
      ];
    }

    // Add filters
    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte = startDate;
      }

      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    return {
      transactions,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Initiate a deposit transaction
   */
  static async initiateDeposit(
    buyerId: string | Types.ObjectId,
    amount: number,
    paymentMethod: string,
    paymentReference: string,
    metadata: Record<string, unknown> = {}
  ) {
    if (amount < 10) {
      throw new Error('Minimum deposit amount is 10 THB');
    }

    const buyerIdObj = typeof buyerId === 'string' ? new Types.ObjectId(buyerId) : buyerId;

    // Create pending transaction
    const transaction = await Transaction.createDepositTransaction(
      buyerIdObj,
      amount,
      paymentMethod,
      paymentReference,
      metadata
    );

    // Create activity record
    const activity = await Activity.create({
      type: 'deposit',
      category: 'financial',
      status: 'pending',
      actors: {
        primary: {
          id: buyerIdObj,
          type: 'buyer',
        },
      },
      metadata: {
        amount,
        currency: 'THB',
        paymentMethod,
        paymentReference,
        transactionId: transaction.transactionId,
      },
    });

    return {
      transaction,
      activity,
    };
  }

  /**
   * Complete a deposit transaction
   */
  static async completeDeposit(
    transactionId: string,
    status: 'completed' | 'failed' | 'cancelled',
    reason?: string
  ) {
    const transaction = await Transaction.findOne({ transactionId });

    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (transaction.status !== 'pending' && transaction.status !== 'processing') {
      throw new Error(`Transaction ${transactionId} is already ${transaction.status}`);
    }

    // Update transaction status
    const updatedTransaction = await Transaction.updateTransactionStatus(
      transactionId,
      status,
      reason
    );

    // If completed, add funds to buyer's balance
    if (
      status === 'completed' &&
      transaction.destinationType === 'buyer' &&
      transaction.destinationId
    ) {
      await Balance.updateBalance(
        transaction.destinationId,
        'buyer',
        transaction.amount,
        'wallet',
        'add'
      );
    }

    // Update activity status
    const activity = await Activity.findOne({
      'metadata.transactionId': transactionId,
    });

    if (activity) {
      activity.status = status;
      if (status === 'completed') {
        activity.completedAt = new Date();
      }
      await activity.save();
    }

    return {
      transaction: updatedTransaction,
      activity,
    };
  }
}
