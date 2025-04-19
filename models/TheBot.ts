import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, required: true },
  message: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  command: { type: String },
  status: { type: String },
  output: { type: String },
  error: { type: String },
});

const theBotSchema = new mongoose.Schema({
  botId: { type: String, required: true, unique: true },
  botState: { type: String, required: true },
  parameters: [{ type: String }],
  activity: [activitySchema],
});

export const TheBot = mongoose.models.TheBot || mongoose.model('TheBot', theBotSchema);
