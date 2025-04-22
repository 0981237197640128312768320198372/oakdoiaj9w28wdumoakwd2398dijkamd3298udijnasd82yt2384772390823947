import { Schema, model, models } from 'mongoose';

const accountSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, required: true },
  detail: { type: String },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});
const Account = models.Account || model('ListAccount', accountSchema);
export default Account;
