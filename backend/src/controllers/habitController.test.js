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

  it('getHabitById maps service status code', async () => {
    mockHabitService.getHabitById.mockRejectedValue({ statusCode: 404, message: 'Not found' })
    const req = { params: { id: 'h404' }, user: { userId: 'u1' } }
    const res = createRes()

    await getHabitById(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' })
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

  it('updateHabit returns 404 for P2025', async () => {
    mockHabitService.updateHabit.mockRejectedValue({ code: 'P2025' })
    const req = { params: { id: 'h1' }, body: { name: 'X' }, user: { userId: 'u1' } }
    const res = createRes()

    await updateHabit(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Gewohnheit nicht gefunden.' })
  })

  it('deleteHabit returns 204 on success', async () => {
    mockHabitService.deleteHabit.mockResolvedValue(undefined)
    const req = { params: { id: 'h1' }, user: { userId: 'u1' } }
    const res = createRes()

    await deleteHabit(req, res)

    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
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

  it('getHabitCheckins returns entries', async () => {
    mockHabitService.getHabitById.mockResolvedValue({ id: 'h1' })
    mockTrackingService.getEntriesByHabitId.mockResolvedValue([{ id: 'e1' }])
    const req = { params: { habitId: 'h1' }, user: { userId: 'u1' } }
    const res = createRes()

    await getHabitCheckins(req, res)

    expect(res.json).toHaveBeenCalledWith([{ id: 'e1' }])
  })

  it('resetCheckinsForDate returns success', async () => {
    mockTrackingService.deleteEntriesByDate.mockResolvedValue({ count: 2 })
    const req = { body: { date: '2026-07-28' }, user: { userId: 'u1' } }
    const res = createRes()

    await resetCheckinsForDate(req, res)

    expect(mockTrackingService.deleteEntriesByDate).toHaveBeenCalledWith('2026-07-28', 'u1')
    expect(res.json).toHaveBeenCalledWith({ success: true })
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
})
