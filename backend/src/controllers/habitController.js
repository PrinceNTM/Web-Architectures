import { addClient, removeClient } from '../utils/sseManager.js'
import * as HabitService from '../services/habits.service.js';
import * as TrackingService from '../services/tracking.service.js';
import { ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js'

// Direkte Prisma-Importe und SSE/Email-Utility-Importe wurden aus dem Controller entfernt,
// da deren Logik nun im Service-Layer gekapselt ist.

export const getHabits = async (req, res) => {
  try {
    const habits = await HabitService.getAllHabits(req.user.userId);
    return res.json(habits);
  } catch (error) {
    logger.error('habit.list.failed', error)
    res.status(500).json({ error: 'Interner Serverfehler.' })
  }
}

export const getHabitById = async (req, res) => {
  try {
    const habit = await HabitService.getHabitById(req.params.id, req.user.userId);
    return res.status(200).json(habit);
  } catch (error) {
    const status = error.statusCode || 500;
    logger.error('habit.get.failed', error)
    return res.status(status).json({ error: error.message || 'Interner Serverfehler.' });
  }
}

export const createHabit = async (req, res) => {
  try {
    // 1. Input lesen
    const userId = req.user.userId;
    const data = req.body;

    // 2. Service aufrufen
    const newHabit = await HabitService.createHabit(data, userId);

    // 3. Ergebnis zurückgeben
    return res.status(201).json(newHabit);
  } catch (error) {
    // 4. Fehler korrekt mappen
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Interner Serverfehler.' });
  }
}

export const updateHabit = async (req, res) => {
  try {
    const updatedHabit = await HabitService.updateHabit(req.params.id, req.body, req.user.userId);
    return res.json(updatedHabit)
  } catch (error) {
    const status = error.statusCode || 500;
    if (error.code === 'P2025' || status === 404) {
      return res.status(404).json({ error: 'Gewohnheit nicht gefunden.' })
    }
    logger.error('habit.update.failed', error)
    res.status(500).json({ error: 'Interner Serverfehler.' })
  }
}

export const deleteHabit = async (req, res) => {
  try {
    await HabitService.deleteHabit(req.params.id, req.user.userId);
    return res.status(204).send();
  } catch (error) {
    const status = error.statusCode || 500;
    if (error.code === 'P2025' || status === 404) {
      return res.status(404).json({ error: 'Gewohnheit nicht gefunden.' })
    }
    logger.error('habit.delete.failed', error)
    res.status(500).json({ error: 'Interner Serverfehler.' })
  }
}

export const checkInHabit = async (req, res) => {
  try {
    const { habitId } = req.params
    const { date } = req.body
    const userId = req.user.userId

    await HabitService.getHabitById(habitId, userId);
    const checkin = await TrackingService.createEntry(habitId, userId, date, 1)
    res.status(201).json(checkin)
  } catch (error) {
    logger.error('habit.checkin.create.failed', error)
    const status = error.statusCode || 500
    res.status(status).json({ error: error.message || 'Interner Serverfehler.' })
  }
}

export const removeHabitCheckin = async (req, res) => {
  try {
    const { habitId } = req.params
    const { date } = req.query
    const userId = req.user.userId

    await HabitService.getHabitById(habitId, userId);
    await TrackingService.deleteEntry(habitId, userId, date)
    res.status(204).send()
  } catch (error) {
    logger.error('habit.checkin.delete.failed', error)
    const status = error.statusCode || 500
    res.status(status).json({ error: error.message || 'Interner Serverfehler.' })
  }
}

export const getHabitCheckins = async (req, res) => {
  try {
    const { habitId } = req.params
    const userId = req.user.userId

    await HabitService.getHabitById(habitId, userId);
    const checkins = await TrackingService.getEntriesByHabitId(habitId, userId)
    res.json(checkins)
  } catch (error) {
    logger.error('habit.checkin.list.failed', error)
    const status = error.statusCode || 500
    res.status(status).json({ error: error.message || 'Interner Serverfehler.' })
  }
}

export const resetCheckinsForDate = async (req, res) => {
  try {
    const { date } = req.body
    await TrackingService.deleteEntriesByDate(date, req.user.userId)
    res.json({ success: true })
  } catch (error) {
    logger.error('habit.checkin.reset.failed', error)
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
  
  // Initiale Verbindungs-Nachricht senden
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE verbunden' })}\n\n`)
  
  // Heartbeat alle 30 Sekunden, um Verbindung lebendig zu halten
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`)
    } catch (error) {
      logger.error('habit.sse.heartbeat_failed', error)
      clearInterval(heartbeatInterval)
      removeClient(userId, res)
    }
  }, 30000)
  
  // Cleanup bei Client-Disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval)
    removeClient(userId, res)
    res.end()
  })
}
