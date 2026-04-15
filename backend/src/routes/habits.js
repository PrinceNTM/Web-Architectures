import express from 'express'
import {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  checkInHabit,
  getHabitCheckins,
} from '../controllers/habitController.js'

const router = express.Router()

// Habit CRUD routes
router.get('/', getHabits)
router.get('/:id', getHabitById)
router.post('/', createHabit)
router.put('/:id', updateHabit)
router.delete('/:id', deleteHabit)

// Check-in routes
router.post('/:habitId/checkin', checkInHabit)
router.get('/:habitId/checkins', getHabitCheckins)

export default router
