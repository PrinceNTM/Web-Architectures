import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import http from 'http'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import prisma from './prisma.js'
import authRoutes from './routes/auth.js'
import habitRoutes from './routes/habits.js'
import userRoutes from './routes/user.js'
import { initializeSocket } from './realtime/socket.js'
import { startEmailQueueWorker } from './emails/emailQueue.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174']

const corsOriginHandler = (origin, callback) => {
  if (!origin) return callback(null, true)
  
  // Allow all local origins (localhost, 127.0.0.1, or local subnet IPs) and development environments
  const isLocal = origin.startsWith('http://localhost:') || 
                  origin.startsWith('http://127.0.0.1:') || 
                  origin.startsWith('http://[::1]:') || 
                  origin.startsWith('http://192.168.') || 
                  origin.startsWith('http://10.') || 
                  origin.startsWith('http://172.16.') || 
                  origin.startsWith('http://172.31.')
                  
  if (isLocal || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    return callback(null, true)
  }
  return callback(new Error('Not allowed by CORS'))
}

// Middleware
app.use(cors({
  origin: corsOriginHandler,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
}))
app.use(cookieParser())
app.use(express.json())

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
  console.error(err.stack)
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
