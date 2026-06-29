import mongoose from 'mongoose'
import { env } from './env.js'
import { ensureDefaultCoupons } from '../services/couponService.js'
import { logger } from '../utils/logger.js'

export async function connectDB() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required. Set it in server/.env')
  }

  mongoose.set('strictQuery', true)

  try {
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    })
    logger.info(`Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`)
    await ensureDefaultCoupons()
  } catch (err) {
    logger.error('MongoDB connection failed', err)
    throw err
  }
}
