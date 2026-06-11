import prisma from '../prisma.js'
import { enqueueEmail } from '../emails/emailQueue.js'
import { addClient, removeClient, broadcastEvent } from '../utils/sseManager.js'

export const getHabits = async (req, res) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user.userId },
      include: { entries: true }
    })
    res.json(habits)
  } catch (error) {
    console.error('Error fetching habits:', error)
    res.status(500).json({ error: 'Interner Serverfehler.' })
  }
}

export const getHabitById = async (req, res) => {
  try {
    const habit = await prisma.habit.findUnique({
      where: { id: req.params.id },
      include: { entries: true }
    })
    if (!habit) {
      return res.status(404).json({ error: 'Gewohnheit nicht gefunden.' })
    }
    if (habit.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Zugriff verweigert.' })
    }
    res.json(habit)
  } catch (error) {
    console.error('Error fetching habit:', error)
    res.status(500).json({ error: 'Interner Serverfehler.' })
  }
}

export const createHabit = async (req, res) => {
  try {
    const { name, category } = req.body
    if (!name) {
      return res.status(400).json({ error: 'Name ist erforderlich.' })
    }
    const habit = await prisma.habit.create({
      data: {
        name,
        category,
        userId: req.user.userId
      },
      include: { entries: true }
    })
    
    // Broadcast event to all connected clients
    broadcastEvent(req.user.userId, 'habit_created', {
      habitId: habit.id,
      name: habit.name,
      category: habit.category,
      timestamp: new Date().toISOString()
    })

    if (req.user?.email) {
      enqueueEmail({
        type: 'habit_created',
        to: req.user.email,
        habitName: habit.name,
        createdAt: habit.createdAt || new Date().toISOString(),
        appUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
        habitId: habit.id,
      })
    }
    
    res.status(201).json(habit)
  } catch (error) {
    console.error('Error creating habit:', error)
    res.status(500).json({ error: 'Interner Serverfehler.' })
  }
}

export const updateHabit = async (req, res) => {
  try {
    const habit = await prisma.habit.findUnique({
      where: { id: req.params.id }
    })
    if (!habit) {
      return res.status(404).json({ error: 'Gewohnheit nicht gefunden.' })
    }
    if (habit.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Zugriff verweigert.' })
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
      return res.status(404).json({ error: 'Gewohnheit nicht gefunden.' })
    }
    console.error('Error updating habit:', error)
    res.status(500).json({ error: 'Interner Serverfehler.' })
  }
}

export const deleteHabit = async (req, res) => {
  try {
    const habit = await prisma.habit.findUnique({
      where: { id: req.params.id }
    })
    if (!habit) {
      return res.status(404).json({ error: 'Gewohnheit nicht gefunden.' })
    }
    if (habit.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Zugriff verweigert.' })
    }
    await prisma.habit.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Gewohnheit nicht gefunden.' })
    }
    console.error('Error deleting habit:', error)
    res.status(500).json({ error: 'Interner Serverfehler.' })
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
      return res.status(404).json({ error: 'Gewohnheit nicht gefunden.' })
    }
    if (habit.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Zugriff verweigert.' })
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
    res.status(500).json({ error: 'Interner Serverfehler.' })
  }
}

export const getHabitCheckins = async (req, res) => {
  try {
    const { habitId } = req.params
    const habit = await prisma.habit.findUnique({
      where: { id: habitId }
    })
    if (!habit) {
      return res.status(404).json({ error: 'Gewohnheit nicht gefunden.' })
    }
    if (habit.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Zugriff verweigert.' })
    }
    const checkins = await prisma.entry.findMany({
      where: { habitId }
    })
    res.json(checkins)
  } catch (error) {
    console.error('Error fetching habit checkins:', error)
    res.status(500).json({ error: 'Interner Serverfehler.' })
  }
}

export const setupSSEConnection = (req, res) => {
  const userId = req.user.userId
  
  // SSE Response Headers setzen
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  
  // Client registrieren
  addClient(userId, res)
  
  console.log(`SSE-Connection für User ${userId} hergestellt`)
  
  // Initiale Verbindungs-Nachricht senden
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE verbunden' })}\n\n`)
  
  // Heartbeat alle 30 Sekunden, um Verbindung lebendig zu halten
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`)
    } catch (error) {
      console.error('Fehler beim Heartbeat:', error)
      clearInterval(heartbeatInterval)
      removeClient(userId, res)
    }
  }, 30000)
  
  // Cleanup bei Client-Disconnect
  req.on('close', () => {
    console.log(`SSE-Connection für User ${userId} geschlossen`)
    clearInterval(heartbeatInterval)
    removeClient(userId, res)
    res.end()
  })
}
