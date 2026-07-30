import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockHabitService, mockTrackingService, mockAddClient, mockRemoveClient } = vi.hoisted(() => ({
  mockHabitService: {
    getAllHabits: vi.fn(),
    getHabitById: vi.fn(),
    createHabit: vi.fn(),
    updateHabit: vi.fn(),
    deleteHabit: vi.fn(),
  },
  mockTrackingService: {
    createEntry: vi.fn(),
    deleteEntry: vi.fn(),
    getEntriesByHabitId: vi.fn(),
    deleteEntriesByDate: vi.fn(),
  },
  mockAddClient: vi.fn(),
  mockRemoveClient: vi.fn(),
}))

vi.mock('../services/habits.service.js', () => mockHabitService)
vi.mock('../services/tracking.service.js', () => mockTrackingService)
vi.mock('../utils/sseManager.js', () => ({
  addClient: (...args) => mockAddClient(...args),
  removeClient: (...args) => mockRemoveClient(...args),
}))

import {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  checkInHabit,
  removeHabitCheckin,
  getHabitCheckins,
  resetCheckinsForDate,
  setupSSEConnection,
} from './habitController.js'
import { ValidationError } from '../utils/errors.js'

const createRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  send: vi.fn().mockReturnThis(),
  setHeader: vi.fn(),
  write: vi.fn(),
  end: vi.fn(),
})

describe('habitController', () => {
  beforeEach(() => {
    Object.values(mockHabitService).forEach((fn) => fn.mockReset())
    Object.values(mockTrackingService).forEach((fn) => fn.mockReset())
    mockAddClient.mockReset()
    mockRemoveClient.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('getHabits returns habits', async () => {
    mockHabitService.getAllHabits.mockResolvedValue([{ id: 'h1' }])
    const req = { user: { userId: 'u1' } }
    const res = createRes()

    await getHabits(req, res)

    expect(res.json).toHaveBeenCalledWith([{ id: 'h1' }])
  })

  it('getHabits returns 500 when service throws', async () => {
    mockHabitService.getAllHabits.mockRejectedValue(new Error('db down'))
    const req = { user: { userId: 'u1' } }
    const res = createRes()

    await getHabits(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Interner Serverfehler.' })
  })

  it('getHabitById returns 200 for found habit', async () => {
    mockHabitService.getHabitById.mockResolvedValue({ id: 'h1' })
    const req = { params: { id: 'h1' }, user: { userId: 'u1' } }
    const res = createRes()

    await getHabitById(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ id: 'h1' })
  })

  it('getHabitById maps service status code', async () => {
    mockHabitService.getHabitById.mockRejectedValue({ statusCode: 404, message: 'Not found' })
    const req = { params: { id: 'h404' }, user: { userId: 'u1' } }
    const res = createRes()

    await getHabitById(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' })
  })

  it('getHabitById uses default status/message on unknown error', async () => {
    mockHabitService.getHabitById.mockRejectedValue({})
    const req = { params: { id: 'x' }, user: { userId: 'u1' } }
    const res = createRes()

    await getHabitById(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Interner Serverfehler.' })
  })

  it('createHabit returns 201 on success', async () => {
    mockHabitService.createHabit.mockResolvedValue({ id: 'h1' })
    const req = { user: { userId: 'u1' }, body: { name: 'Run' } }
    const res = createRes()

    await createHabit(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ id: 'h1' })
  })

  it('createHabit maps ValidationError to 400', async () => {
    mockHabitService.createHabit.mockRejectedValue(new ValidationError('Name fehlt'))
    const req = { user: { userId: 'u1' }, body: {} }
    const res = createRes()

    await createHabit(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Name fehlt' })
  })

  it('createHabit returns 500 on generic error', async () => {
    mockHabitService.createHabit.mockRejectedValue(new Error('unexpected'))
    const req = { user: { userId: 'u1' }, body: { name: 'Run' } }
    const res = createRes()

    await createHabit(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Interner Serverfehler.' })
  })

  it('updateHabit returns updated habit on success', async () => {
    mockHabitService.updateHabit.mockResolvedValue({ id: 'h1', name: 'Updated' })
    const req = { params: { id: 'h1' }, body: { name: 'Updated' }, user: { userId: 'u1' } }
    const res = createRes()

    await updateHabit(req, res)

    expect(res.json).toHaveBeenCalledWith({ id: 'h1', name: 'Updated' })
  })

  it('updateHabit returns 404 for P2025', async () => {
    mockHabitService.updateHabit.mockRejectedValue({ code: 'P2025' })
    const req = { params: { id: 'h1' }, body: { name: 'X' }, user: { userId: 'u1' } }
    const res = createRes()

    await updateHabit(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Gewohnheit nicht gefunden.' })
  })

  it('updateHabit returns 404 for statusCode 404', async () => {
    mockHabitService.updateHabit.mockRejectedValue({ statusCode: 404 })
    const req = { params: { id: 'h1' }, body: { name: 'X' }, user: { userId: 'u1' } }
    const res = createRes()

    await updateHabit(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Gewohnheit nicht gefunden.' })
  })

  it('updateHabit returns 500 for non-404 error', async () => {
    mockHabitService.updateHabit.mockRejectedValue(new Error('boom'))
    const req = { params: { id: 'h1' }, body: { name: 'X' }, user: { userId: 'u1' } }
    const res = createRes()

    await updateHabit(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Interner Serverfehler.' })
  })

  it('deleteHabit returns 204 on success', async () => {
    mockHabitService.deleteHabit.mockResolvedValue(undefined)
    const req = { params: { id: 'h1' }, user: { userId: 'u1' } }
    const res = createRes()

    await deleteHabit(req, res)

    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })

  it('deleteHabit returns 404 for statusCode 404', async () => {
    mockHabitService.deleteHabit.mockRejectedValue({ statusCode: 404 })
    const req = { params: { id: 'h1' }, user: { userId: 'u1' } }
    const res = createRes()

    await deleteHabit(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Gewohnheit nicht gefunden.' })
  })

  it('deleteHabit returns 500 for generic error', async () => {
    mockHabitService.deleteHabit.mockRejectedValue(new Error('boom'))
    const req = { params: { id: 'h1' }, user: { userId: 'u1' } }
    const res = createRes()

    await deleteHabit(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Interner Serverfehler.' })
  })

  it('checkInHabit checks ownership and creates entry', async () => {
    mockHabitService.getHabitById.mockResolvedValue({ id: 'h1' })
    mockTrackingService.createEntry.mockResolvedValue({ id: 'e1' })
    const req = {
      params: { habitId: 'h1' },
      body: { date: '2026-07-28' },
      user: { userId: 'u1' },
    }
    const res = createRes()

    await checkInHabit(req, res)

    expect(mockTrackingService.createEntry).toHaveBeenCalledWith('h1', 'u1', '2026-07-28', 1)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ id: 'e1' })
  })

  it('checkInHabit maps service errors with status/message', async () => {
    mockHabitService.getHabitById.mockRejectedValue({ statusCode: 403, message: 'Forbidden' })
    const req = {
      params: { habitId: 'h1' },
      body: { date: '2026-07-28' },
      user: { userId: 'u1' },
    }
    const res = createRes()

    await checkInHabit(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' })
  })

  it('removeHabitCheckin returns 204', async () => {
    mockHabitService.getHabitById.mockResolvedValue({ id: 'h1' })
    mockTrackingService.deleteEntry.mockResolvedValue({ count: 1 })
    const req = {
      params: { habitId: 'h1' },
      query: { date: '2026-07-28' },
      user: { userId: 'u1' },
    }
    const res = createRes()

    await removeHabitCheckin(req, res)

    expect(res.status).toHaveBeenCalledWith(204)
  })

  it('removeHabitCheckin uses default error message when missing', async () => {
    mockHabitService.getHabitById.mockRejectedValue({ statusCode: 500 })
    const req = {
      params: { habitId: 'h1' },
      query: { date: '2026-07-28' },
      user: { userId: 'u1' },
    }
    const res = createRes()

    await removeHabitCheckin(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Interner Serverfehler.' })
  })

  it('getHabitCheckins returns entries', async () => {
    mockHabitService.getHabitById.mockResolvedValue({ id: 'h1' })
    mockTrackingService.getEntriesByHabitId.mockResolvedValue([{ id: 'e1' }])
    const req = { params: { habitId: 'h1' }, user: { userId: 'u1' } }
    const res = createRes()

    await getHabitCheckins(req, res)

    expect(res.json).toHaveBeenCalledWith([{ id: 'e1' }])
  })

  it('getHabitCheckins maps service error status', async () => {
    mockHabitService.getHabitById.mockRejectedValue({ statusCode: 404, message: 'Not found' })
    const req = { params: { habitId: 'h1' }, user: { userId: 'u1' } }
    const res = createRes()

    await getHabitCheckins(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' })
  })

  it('resetCheckinsForDate returns success', async () => {
    mockTrackingService.deleteEntriesByDate.mockResolvedValue({ count: 2 })
    const req = { body: { date: '2026-07-28' }, user: { userId: 'u1' } }
    const res = createRes()

    await resetCheckinsForDate(req, res)

    expect(mockTrackingService.deleteEntriesByDate).toHaveBeenCalledWith('2026-07-28', 'u1')
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('resetCheckinsForDate returns 500 on failure', async () => {
    mockTrackingService.deleteEntriesByDate.mockRejectedValue(new Error('db'))
    const req = { body: { date: '2026-07-28' }, user: { userId: 'u1' } }
    const res = createRes()

    await resetCheckinsForDate(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Interner Serverfehler.' })
  })

  it('setupSSEConnection sets headers, sends initial message and handles close', () => {
    vi.useFakeTimers()
    const req = {
      user: { userId: 'u1' },
      on: vi.fn(),
    }
    const res = createRes()
    let closeHandler
    req.on.mockImplementation((event, cb) => {
      if (event === 'close') closeHandler = cb
    })

    setupSSEConnection(req, res)

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream')
    expect(mockAddClient).toHaveBeenCalledWith('u1', res)
    expect(res.write).toHaveBeenCalledWith(expect.stringContaining('SSE verbunden'))

    vi.advanceTimersByTime(30000)
    expect(res.write).toHaveBeenCalledWith(': heartbeat\n\n')

    closeHandler()
    expect(mockRemoveClient).toHaveBeenCalledWith('u1', res)
    expect(res.end).toHaveBeenCalled()
  })

  it('setupSSEConnection removes client when heartbeat write fails', () => {
    vi.useFakeTimers()
    const req = {
      user: { userId: 'u1' },
      on: vi.fn(),
    }
    const res = createRes()
    let heartbeatCalls = 0
    res.write = vi.fn(() => {
      heartbeatCalls += 1
      if (heartbeatCalls > 1) {
        throw new Error('write failed')
      }
    })

    setupSSEConnection(req, res)

    vi.advanceTimersByTime(30000)

    expect(mockRemoveClient).toHaveBeenCalledWith('u1', res)
  })
})
