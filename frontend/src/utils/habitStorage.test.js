import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildHabitUpdatePayload,
  clearStoredHabits,
  normalizeHabit,
  normalizeHabits,
  readStoredHabits,
  writeStoredHabits,
} from './habitStorage.js'

describe('habitStorage helpers', () => {
  beforeEach(() => {
    clearStoredHabits()
  })

  it('maps backend fields to the frontend habit shape', () => {
    const habit = normalizeHabit({
      id: 'habit-1',
      name: 'Read',
      category: 'Learning',
      targetPerDay: 2,
      reminder: true,
      timeOfDay: 'Abend',
    })

    expect(habit.total).toBe(2)
    expect(habit.timeRange).toBe('Abend')
    expect(habit.reminder).toBe(true)
  })

  it('fills defaults and sanitizes non-numeric values', () => {
    const habit = normalizeHabit({
      name: null,
      total: 'abc',
      completedCount: '2',
      streak: undefined,
      isChecked: 1,
      reminder: 0,
    })

    expect(habit.name).toBe('')
    expect(habit.category).toBe('General')
    expect(habit.total).toBe(0)
    expect(habit.completedCount).toBe(2)
    expect(habit.streak).toBe(0)
    expect(habit.isChecked).toBe(true)
    expect(habit.reminder).toBe(false)
  })

  it('builds the backend payload for updates', () => {
    const payload = buildHabitUpdatePayload({
      name: 'Meditate',
      category: 'Wellness',
      targetPerDay: 3,
      reminder: true,
      timeOfDay: 'Morgen',
    })

    expect(payload).toEqual({
      name: 'Meditate',
      category: 'Wellness',
      targetPerDay: 3,
      reminder: true,
      timeOfDay: 'Morgen',
    })
  })

  it('builds update payload with defaults', () => {
    const payload = buildHabitUpdatePayload({ dailyGoal: 'x' })

    expect(payload).toEqual({
      name: '',
      category: 'General',
      targetPerDay: 0,
      reminder: false,
      timeOfDay: 'Morgen',
    })
  })

  it('normalizes habit arrays and round-trips localStorage', () => {
    const normalized = writeStoredHabits([
      { id: '1', name: 'Read', targetPerDay: 1 },
      { id: '2', name: 'Walk', total: 2 },
    ])

    expect(normalized).toHaveLength(2)
    expect(normalizeHabits([{ id: '3', name: 'Code' }])[0].name).toBe('Code')
    expect(readStoredHabits()).toHaveLength(2)
  })

  it('returns [] when stored JSON is invalid', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    window.localStorage.setItem('habit-tracker-habits', '{invalid-json')

    expect(readStoredHabits()).toEqual([])

    spy.mockRestore()
  })
})
