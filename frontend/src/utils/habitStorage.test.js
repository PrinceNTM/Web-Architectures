import { describe, expect, it } from 'vitest'
import { buildHabitUpdatePayload, normalizeHabit } from './habitStorage.js'

describe('habitStorage helpers', () => {
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
})
