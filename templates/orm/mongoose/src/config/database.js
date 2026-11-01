import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDB() {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error', err));
  await mongoose.connect(env.db);
}

export async function disconnectDB() {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
}
