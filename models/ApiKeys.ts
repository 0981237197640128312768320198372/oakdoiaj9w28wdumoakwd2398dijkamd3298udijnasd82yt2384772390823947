import { Schema, model, models } from 'mongoose';

const apiKeySchema = new Schema({
  key: { type: String, required: true, unique: true },
  limit: { type: Number, required: true },
  usage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const ApiKey = models.ApiKey || model('ApiKey', apiKeySchema);
export default ApiKey;
