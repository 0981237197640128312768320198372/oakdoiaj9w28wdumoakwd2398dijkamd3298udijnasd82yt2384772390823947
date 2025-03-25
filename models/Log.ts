import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  activity: {
    type: { type: String, required: true },
    user: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
  },
});

export default mongoose.models.Log || mongoose.model('Log', logSchema);
