import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { mongoSanitizeMiddleware } from './middleware/mongoSanitize.js'
import { corsOrigin } from './config/cors.js'
import routes from './routes/index.js'
import webhookRoutes from './routes/webhookRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimiter.js'

const app = express()

app.set('trust proxy', 1)

app.use(helmet())
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
)

// Razorpay webhooks require the raw body for HMAC verification.
// Mount before JSON parsing and outside the global API rate limiter.
app.use(
  '/api/webhooks',
  express.raw({ type: 'application/json', limit: '1mb' }),
  webhookRoutes
)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(mongoSanitizeMiddleware)
app.use(apiLimiter)

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app
