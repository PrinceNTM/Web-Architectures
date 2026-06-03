import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { register, login, me, logout, getSSEToken } from '../controllers/authController.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)

// Protected routes
router.get('/me', authenticate, me)
router.post('/logout', authenticate, logout)
router.get('/sse-token', authenticate, getSSEToken)

export default router
