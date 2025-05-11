import { Schema, model, models } from 'mongoose';

const apiKeySchema = new Schema({
  key: { type: String, required: true, unique: true },
  remainingLimit: { type: Number, required: true },
  resetDate: { type: Date },
});

const ApiKey = models.ApiKey || model('ApiKey', apiKeySchema);
export default ApiKey;
