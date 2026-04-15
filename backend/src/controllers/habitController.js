import { habitModel, checkinModel } from '../models/Habit.js'

export const getHabits = (req, res) => {
  const habits = habitModel.findAll()
  res.json(habits)
}

export const getHabitById = (req, res) => {
  const habit = habitModel.findById(req.params.id)
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' })
  }
  res.json(habit)
}

export const createHabit = (req, res) => {
  const { name, description, category } = req.body
  if (!name) {
    return res.status(400).json({ error: 'Name is required' })
  }
  const habit = habitModel.create({ name, description, category })
  res.status(201).json(habit)
}

export const updateHabit = (req, res) => {
  const habit = habitModel.update(req.params.id, req.body)
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' })
  }
  res.json(habit)
}

export const deleteHabit = (req, res) => {
  const deleted = habitModel.delete(req.params.id)
  if (!deleted) {
    return res.status(404).json({ error: 'Habit not found' })
  }
  res.json({ message: 'Habit deleted' })
}

export const checkInHabit = (req, res) => {
  const { habitId } = req.params
  const { date } = req.body
  
  const habit = habitModel.findById(habitId)
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' })
  }
  
  const checkin = checkinModel.createCheckin(habitId, date || new Date().toISOString().split('T')[0])
  res.status(201).json(checkin)
}

export const getHabitCheckins = (req, res) => {
  const { habitId } = req.params
  const habit = habitModel.findById(habitId)
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' })
  }
  const checkins = checkinModel.getCheckins(habitId)
  res.json(checkins)
}
