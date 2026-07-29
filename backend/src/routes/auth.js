import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authRateLimiter, loginRateLimiter, registerRateLimiter } from '../middleware/rateLimit.js'
import { register, login, me, logout } from '../controllers/authController.js'
import { getCurrentUserProfile, updateUserProfile } from '../controllers/userController.js'

const router = express.Router()

// Public routes
router.post('/register', registerRateLimiter, register)
router.post('/login', loginRateLimiter, login)

router.use(authRateLimiter)
router.use(authenticate)

// Protected routes
router.get('/me', me)
router.get('/profile', getCurrentUserProfile)
router.put('/profile', updateUserProfile)
router.post('/logout', logout)

export default router
