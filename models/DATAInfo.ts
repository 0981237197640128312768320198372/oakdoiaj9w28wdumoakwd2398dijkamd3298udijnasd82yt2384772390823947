import mongoose from 'mongoose';

const DATAInfoSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  DATA: { type: String, required: true, unique: true },
  street: { type: String, required: true },
  zipCode: { type: String, required: true },
  city: { type: String, required: true },
  date: { type: Date, default: Date.now },
  license: { type: String, required: true },
  type: { type: String, enum: ['Used', 'Bad', 'Unused'], required: true },
});

export default mongoose.models.DATAInfo || mongoose.model('DATAInfo', DATAInfoSchema);
