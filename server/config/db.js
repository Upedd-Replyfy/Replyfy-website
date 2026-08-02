import mongoose from 'mongoose'
import { env } from './env.js'
import { ensureDefaultCoupons } from '../services/couponService.js'
import { logger } from '../utils/logger.js'
import ExpertProfile from '../models/ExpertProfile.js'

async function repairExpertProfileIndexes() {
  try {
    const collection = ExpertProfile.collection
    const indexes = await collection.indexes()
    for (const idx of indexes) {
      const keys = Object.keys(idx.key || {})
      // Drop illegal compound indexes that include both array fields
      if (keys.includes('categories') && keys.includes('expertTypes')) {
        await collection.dropIndex(idx.name)
        logger.info(`Dropped invalid ExpertProfile index: ${idx.name}`)
      }
    }
    await ExpertProfile.syncIndexes()
  } catch (err) {
    logger.warn('ExpertProfile index repair skipped', err?.message || err)
  }
}

/** Ensure every mentor has categories/expertTypes arrays (at least primary). */
async function backfillExpertCatalogArrays() {
  try {
    const result = await ExpertProfile.updateMany(
      {
        $or: [
          { categories: { $exists: false } },
          { categories: { $size: 0 } },
          { categories: null },
        ],
        category: { $exists: true, $ne: null },
      },
      [{ $set: { categories: ['$category'] } }]
    )
    const typesResult = await ExpertProfile.updateMany(
      {
        $or: [
          { expertTypes: { $exists: false } },
          { expertTypes: { $size: 0 } },
          { expertTypes: null },
        ],
        expertType: { $exists: true, $ne: null },
      },
      [{ $set: { expertTypes: ['$expertType'] } }]
    )
    const touched = (result.modifiedCount || 0) + (typesResult.modifiedCount || 0)
    if (touched > 0) {
      logger.info(`Backfilled mentor catalog arrays on ${touched} profile field-groups`)
    }
  } catch (err) {
    logger.warn('Expert catalog backfill skipped', err?.message || err)
  }
}

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
    await repairExpertProfileIndexes()
    await backfillExpertCatalogArrays()
    await ensureDefaultCoupons()
  } catch (err) {
    logger.error('MongoDB connection failed', err)
    throw err
  }
}
