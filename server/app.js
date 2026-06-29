import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { mongoSanitizeMiddleware } from './middleware/mongoSanitize.js'
import { corsOrigin } from './config/cors.js'
import routes from './routes/index.js'
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
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(mongoSanitizeMiddleware)
app.use(apiLimiter)

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app
