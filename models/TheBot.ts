import mongoose from 'mongoose';

// Define the schema for bot updates
const TheBotSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  type: { type: String, required: true, enum: ['error', 'success', 'status', 'info'] },
  message: { type: String, required: true },
  details: {
    email: { type: String },
    errorCode: { type: String },
    stack: { type: String },
  },
});

const getTheBotModel = (license: string) => {
  const collectionName = `TheBot_${license}`;
  return (
    mongoose.models[collectionName] || mongoose.model(collectionName, TheBotSchema, collectionName)
  );
};

export default getTheBotModel;
