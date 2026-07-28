import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindFirst = vi.fn()
const mockCreate = vi.fn()
const mockDeleteMany = vi.fn()
const mockFindMany = vi.fn()

vi.mock('../prisma.js', () => ({
  default: {
    entry: {
      findFirst: (...args) => mockFindFirst(...args),
      create: (...args) => mockCreate(...args),
      deleteMany: (...args) => mockDeleteMany(...args),
      findMany: (...args) => mockFindMany(...args),
    },
  },
}))

import {
  createEntry,
  deleteEntry,
  getEntriesByHabitId,
  deleteEntriesByDate,
  getEntriesForPeriod,
} from './tracking.service.js'

describe('tracking.service', () => {
  beforeEach(() => {
    mockFindFirst.mockReset()
    mockCreate.mockReset()
    mockDeleteMany.mockReset()
    mockFindMany.mockReset()
  })

  it('returns existing entry and does not create a duplicate', async () => {
    const existing = { id: 'e1', habitId: 'h1', date: '2026-07-28', value: 1 }
    mockFindFirst.mockResolvedValue(existing)

    const result = await createEntry('h1', '2026-07-28', 1)

    expect(result).toEqual(existing)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('creates a new entry when none exists', async () => {
    mockFindFirst.mockResolvedValue(null)
    mockCreate.mockResolvedValue({ id: 'e2' })

    const result = await createEntry('h1', '2026-07-28', 2)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        habitId: 'h1',
        date: '2026-07-28',
        value: 2,
      },
    })
    expect(result).toEqual({ id: 'e2' })
  })

  it('uses today when date is omitted', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T10:00:00.000Z'))
    mockFindFirst.mockResolvedValue(null)
    mockCreate.mockResolvedValue({ id: 'e3' })

    await createEntry('h1')

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        habitId: 'h1',
        date: '2026-07-29',
      },
    })
    vi.useRealTimers()
  })

  it('deletes an entry by habit and date', async () => {
    mockDeleteMany.mockResolvedValue({ count: 1 })
    await deleteEntry('h1', '2026-07-20')

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        habitId: 'h1',
        date: '2026-07-20',
      },
    })
  })

  it('returns entries by habit id sorted by date', async () => {
    mockFindMany.mockResolvedValue([{ id: 'e1' }])
    const result = await getEntriesByHabitId('h1')

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { habitId: 'h1' },
      orderBy: { date: 'asc' },
    })
    expect(result).toEqual([{ id: 'e1' }])
  })

  it('deletes entries by date', async () => {
    await deleteEntriesByDate('2026-07-01')
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { date: '2026-07-01' },
    })
  })

  it('returns entries for a user and date period', async () => {
    mockFindMany.mockResolvedValue([{ id: 'e9' }])
    const result = await getEntriesForPeriod('u1', '2026-07-01', '2026-07-31')

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        date: { gte: '2026-07-01', lte: '2026-07-31' },
        habit: { userId: 'u1' },
      },
      include: { habit: true },
    })
    expect(result).toEqual([{ id: 'e9' }])
  })
})
