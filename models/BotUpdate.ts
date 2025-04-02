import mongoose from 'mongoose';

// Define the schema for bot updates
const botUpdateSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  type: { type: String, required: true, enum: ['error', 'success', 'status'] },
  message: { type: String, required: true },
  details: {
    email: { type: String },
    errorCode: { type: String },
    stack: { type: String },
  },
});

const getBotUpdateModel = (license: string) => {
  const collectionName = `BotUpdate_${license}`;
  return (
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, botUpdateSchema, collectionName)
  );
};

export default getBotUpdateModel;
