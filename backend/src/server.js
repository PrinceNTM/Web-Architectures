import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import prisma from './prisma.js'
import authRoutes from './routes/auth.js'
import habitRoutes from './routes/habits.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/habits', habitRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' })
})

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
