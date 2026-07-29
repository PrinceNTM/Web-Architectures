import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import http from 'http'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import prisma from './prisma.js'
import authRoutes from './routes/auth.js'
import habitRoutes from './routes/habits.js'
import userRoutes from './routes/user.js'
import { initializeSocket } from './realtime/socket.js'
import { startEmailQueueWorker } from './emails/emailQueue.js'
import { requireRequestedWith } from './middleware/requireRequestedWith.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false)

const parseAllowedOrigins = () => {
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    process.env.ALLOWED_ORIGINS,
    'http://localhost:5173',
    'http://localhost:5174',
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean)

  return configuredOrigins
    .map((value) => {
      try {
        return new URL(value)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

const allowedOriginUrls = parseAllowedOrigins()
const localHostnames = new Set(['localhost', '127.0.0.1'])

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true
  }

  let parsedOrigin

  try {
    parsedOrigin = new URL(origin)
  } catch {
    return false
  }

  if (!['http:', 'https:'].includes(parsedOrigin.protocol)) {
    return false
  }

  if (localHostnames.has(parsedOrigin.hostname)) {
    return true
  }

  return allowedOriginUrls.some((allowedOrigin) => (
    allowedOrigin.origin === parsedOrigin.origin && allowedOrigin.hostname === parsedOrigin.hostname
  ))
}

const corsOriginHandler = (origin, callback) => {
  if (isAllowedOrigin(origin)) {
    return callback(null, true)
  }
  return callback(new Error('Not allowed by CORS'))
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'http://localhost:3000', 'ws://localhost:3000'],
    },
  },
}))
app.use(cors({
  origin: corsOriginHandler,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
}))
app.use(cookieParser())
app.use(express.json({ limit: '100kb' }))
app.use(requireRequestedWith)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/user', userRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error({
    message: err.message,
    path: req.path,
    method: req.method,
  })
  res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' })
})

const server = http.createServer(app)
initializeSocket(server, corsOriginHandler)
startEmailQueueWorker()

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
