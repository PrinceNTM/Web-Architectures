import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { register, login, me, logout, getSSEToken } from '../controllers/authController.js'
import { getCurrentUserProfile, updateUserProfile } from '../controllers/userController.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)

// Protected routes
router.get('/me', authenticate, me)
router.get('/profile', authenticate, getCurrentUserProfile)
router.put('/profile', authenticate, updateUserProfile)
router.post('/logout', authenticate, logout)
router.get('/sse-token', authenticate, getSSEToken)

export default router
