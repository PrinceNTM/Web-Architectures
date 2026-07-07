import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { getCurrentUserProfile, updateUserProfile } from '../controllers/userController.js'

const router = express.Router()

router.get('/me', authenticate, getCurrentUserProfile)
router.put('/profile', authenticate, updateUserProfile)

export default router
