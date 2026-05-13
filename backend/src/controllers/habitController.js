import prisma from '../prisma.js'

export const getHabits = async (req, res) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user.userId },
      include: { entries: true }
    })
    res.json(habits)
  } catch (error) {
    console.error('Error fetching habits:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getHabitById = async (req, res) => {
  try {
    const habit = await prisma.habit.findUnique({
      where: { id: req.params.id },
      include: { entries: true }
    })
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    if (habit.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    res.json(habit)
  } catch (error) {
    console.error('Error fetching habit:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createHabit = async (req, res) => {
  try {
    const { name, category } = req.body
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }
    const habit = await prisma.habit.create({
      data: {
        name,
        category,
        userId: req.user.userId
      },
      include: { entries: true }
    })
    res.status(201).json(habit)
  } catch (error) {
    console.error('Error creating habit:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateHabit = async (req, res) => {
  try {
    const habit = await prisma.habit.findUnique({
      where: { id: req.params.id }
    })
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    if (habit.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    const updatedHabit = await prisma.habit.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        category: req.body.category
      },
      include: { entries: true }
    })
    res.json(updatedHabit)
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Habit not found' })
    }
    console.error('Error updating habit:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteHabit = async (req, res) => {
  try {
    const habit = await prisma.habit.findUnique({
      where: { id: req.params.id }
    })
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    if (habit.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    await prisma.habit.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Habit not found' })
    }
    console.error('Error deleting habit:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const checkInHabit = async (req, res) => {
  try {
    const { habitId } = req.params
    const { date } = req.body

    const habit = await prisma.habit.findUnique({
      where: { id: habitId }
    })
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    if (habit.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const checkin = await prisma.entry.create({
      data: {
        habitId,
        date: date || new Date().toISOString().split('T')[0],
        value: 1
      }
    })
    res.status(201).json(checkin)
  } catch (error) {
    console.error('Error checking in habit:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getHabitCheckins = async (req, res) => {
  try {
    const { habitId } = req.params
    const habit = await prisma.habit.findUnique({
      where: { id: habitId }
    })
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    if (habit.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    const checkins = await prisma.entry.findMany({
      where: { habitId }
    })
    res.json(checkins)
  } catch (error) {
    console.error('Error fetching habit checkins:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
