import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in your .env file');
}

export async function connectToDatabase(): Promise<Mongoose> {
  try {
    const mongooseInstance = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false, // Disable command buffering for serverless environments
    });
    console.log('MongoDB connected successfully');
    return mongooseInstance;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}
