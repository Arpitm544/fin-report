import mongoose from 'mongoose';

/**
 * Connects to MongoDB with sensible defaults for production.
 */
export async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  return mongoose.connection;
}
