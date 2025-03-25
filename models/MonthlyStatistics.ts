// models/MonthlyStatistics.ts
import { Schema, model, models } from 'mongoose';

const MonthlyStatisticsSchema = new Schema({
  month: { type: String, required: true, unique: true },
  days: [
    {
      date: { type: String, required: true },
      depositAmount: { type: Number, default: 0 },
      spentAmount: { type: Number, default: 0 },
      productsSold: { type: Number, default: 0 },
      userLogins: { type: Number, default: 0 },
    },
  ],
});

const MonthlyStatistics =
  models.MonthlyStatistics || model('MonthlyStatistics', MonthlyStatisticsSchema);

export default MonthlyStatistics;
