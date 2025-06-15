import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in your .env file');
}

interface CachedConnection {
  connection: Connection | null;
  promise: Promise<Connection> | null;
}

const cached: CachedConnection = {
  connection: null,
  promise: null,
};

// Optimized connection options for production
const connectionOptions = {
  bufferCommands: false,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
};

export async function connectToDatabase(): Promise<Connection> {
  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, connectionOptions).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose.connection;
    });
  }

  try {
    cached.connection = await cached.promise;
    return cached.connection;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

// Add connection event listeners for better monitoring
// mongoose.connection.on('connected', () => {
//   console.log('Mongoose connected to MongoDB');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('Mongoose connection error:', err);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('Mongoose disconnected from MongoDB');
// });

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});
