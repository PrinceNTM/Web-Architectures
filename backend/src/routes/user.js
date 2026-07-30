import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authRateLimiter } from '../middleware/rateLimit.js'
import { getCurrentUserProfile, updateUserProfile } from '../controllers/userController.js'

const router = express.Router()

router.use(authRateLimiter)
router.use(authenticate)

router.get('/me', getCurrentUserProfile)
router.put('/profile', updateUserProfile)

export default router
