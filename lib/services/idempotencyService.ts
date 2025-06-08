/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from '@/lib/db';
import { Schema, model, Document, models } from 'mongoose';

interface IIdempotencyRecord extends Document {
  key: string;
  result: any;
  status: 'processing' | 'completed' | 'failed';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const idempotencySchema = new Schema<IIdempotencyRecord>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    result: {
      type: Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      required: true,
      default: 'processing',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const IdempotencyRecord =
  models.IdempotencyRecord || model<IIdempotencyRecord>('IdempotencyRecord', idempotencySchema);

export class IdempotencyService {
  /**
   * Generate idempotency key for payment operations
   */
  static generateKey(paymentIntentId: string, userId: string, operation: string): string {
    return `${operation}:${paymentIntentId}:${userId}`;
  }

  /**
   * Check if operation is already processed or in progress
   */
  static async checkIdempotency(key: string): Promise<{
    exists: boolean;
    status?: 'processing' | 'completed' | 'failed';
    result?: any;
  }> {
    await connectToDatabase();

    const record = await IdempotencyRecord.findOne({ key });

    if (!record) {
      return { exists: false };
    }

    // Check if record has expired
    if (record.expiresAt < new Date()) {
      await IdempotencyRecord.deleteOne({ key });
      return { exists: false };
    }

    return {
      exists: true,
      status: record.status,
      result: record.result,
    };
  }

  /**
   * Create idempotency record for processing
   */
  static async createRecord(key: string, ttlMinutes: number = 30): Promise<boolean> {
    await connectToDatabase();

    try {
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      await IdempotencyRecord.create({
        key,
        status: 'processing',
        expiresAt,
      });

      return true;
    } catch (error: any) {
      // If duplicate key error, operation is already in progress
      if (error.code === 11000) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Update idempotency record with result
   */
  static async updateRecord(
    key: string,
    status: 'completed' | 'failed',
    result?: any
  ): Promise<void> {
    await connectToDatabase();

    await IdempotencyRecord.findOneAndUpdate(
      { key },
      {
        status,
        result,
        updatedAt: new Date(),
      }
    );
  }

  /**
   * Execute operation with idempotency protection
   */
  static async executeWithIdempotency<T>(
    key: string,
    operation: () => Promise<T>,
    ttlMinutes: number = 30
  ): Promise<T> {
    // Check if already processed
    const check = await this.checkIdempotency(key);

    if (check.exists) {
      if (check.status === 'completed') {
        return check.result;
      } else if (check.status === 'processing') {
        throw new Error('Operation already in progress');
      } else if (check.status === 'failed') {
        // Allow retry for failed operations
        await IdempotencyRecord.deleteOne({ key });
      }
    }

    // Create processing record
    const created = await this.createRecord(key, ttlMinutes);
    if (!created) {
      throw new Error('Operation already in progress');
    }

    try {
      // Execute operation
      const result = await operation();

      // Update record with success
      await this.updateRecord(key, 'completed', result);

      return result;
    } catch (error) {
      // Update record with failure
      await this.updateRecord(key, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Clean up expired records (for maintenance)
   */
  static async cleanup(): Promise<number> {
    await connectToDatabase();

    const result = await IdempotencyRecord.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    return result.deletedCount || 0;
  }
}
