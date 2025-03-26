import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in your .env file');
}

interface CachedConnection {
  connection: Connection | null;
}

const cached: CachedConnection = {
  connection: null,
};

export async function connectToDatabase(): Promise<Connection> {
  if (cached.connection) {
    return cached.connection;
  }

  try {
    const mongooseConnection = await mongoose.connect(MONGODB_URI);
    cached.connection = mongooseConnection.connection;

    // console.log('MongoDB connected successfully');
    return cached.connection;
  } catch (error) {
    // console.error('MongoDB connection error:', error);
    console.error('MongoDB connection error');
    throw new Error('Failed to connect to MongoDB');
  }
}

// mongoose.connection.on('connected', () => {
//   console.log('Mongoose connected to MongoDB');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('Mongoose connection error:', err);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('Mongoose disconnected');
// });
