import { Schema, model, models } from 'mongoose';

const paymentSchema = new Schema({
  paymentIntentId: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Payment = models.Payment || model('Payment', paymentSchema);
export default Payment;
