import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authRateLimiter, loginRateLimiter, registerRateLimiter } from '../middleware/rateLimit.js'
import { register, login, me, logout } from '../controllers/authController.js'

const router = express.Router()

// Public routes
router.post('/register', registerRateLimiter, authRateLimiter, register)
router.post('/login', loginRateLimiter, authRateLimiter, login)

router.use(authRateLimiter)
router.use(authenticate)

// Protected routes
router.get('/me', me)
router.post('/logout', logout)

export default router
