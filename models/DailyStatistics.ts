import { Schema, model, models } from 'mongoose';

const DailyStatisticsSchema = new Schema({
  date: { type: String, required: true, unique: true },
  entries: [
    {
      time: { type: String, required: true },
      depositAmount: { type: Number, default: 0 },
      spentAmount: { type: Number, default: 0 },
      productsSold: { type: Number, default: 0 },
      userLogins: { type: Number, default: 0 },
    },
  ],
});

const DailyStatistics = models.DailyStatistics || model('DailyStatistics', DailyStatisticsSchema);

export default DailyStatistics;
