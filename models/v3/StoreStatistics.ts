import { Schema, model, Document, Types } from 'mongoose';

interface IMonthlyStat {
  month: string;
  sales: number;
  revenue: number;
}

interface IDailyStat {
  day: string;
  sales: number;
  revenue: number;
}

interface IStoreStatistics extends Document {
  sellerId: Types.ObjectId;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  monthlyStats: IMonthlyStat[];
  dailyStats: IDailyStat[];
  createdAt: Date;
  updatedAt: Date;
}

const storeStatisticsSchema = new Schema<IStoreStatistics>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  totalProducts: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  monthlyStats: [
    {
      month: String,
      sales: Number,
      revenue: Number,
    },
  ],
  dailyStats: [
    {
      day: String,
      sales: Number,
      revenue: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const StoreStatistics = model<IStoreStatistics>('StoreStatistics', storeStatisticsSchema);
