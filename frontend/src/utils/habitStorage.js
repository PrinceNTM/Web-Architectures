const STORAGE_KEY = 'habit-tracker-habits'

const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export const normalizeHabit = (habit = {}) => ({
  id: habit.id ?? Date.now(),
  name: habit.name ?? '',
  category: habit.category ?? 'General',
  timeRange: habit.timeRange ?? habit.timeOfDay ?? 'Morgen',
  total: toNumber(habit.total ?? habit.targetPerDay ?? habit.dailyGoal ?? 0),
  completedCount: toNumber(habit.completedCount ?? 0),
  streak: toNumber(habit.streak ?? 0),
  isChecked: Boolean(habit.isChecked),
  reminder: Boolean(habit.reminder),
  targetPerDay: toNumber(habit.targetPerDay ?? habit.total ?? habit.dailyGoal ?? 0),
  timeOfDay: habit.timeOfDay ?? habit.timeRange ?? 'Morgen',
  createdAt: habit.createdAt ?? null,
})

export const buildHabitUpdatePayload = (updates = {}) => ({
  name: updates.name ?? '',
  category: updates.category ?? 'General',
  targetPerDay: toNumber(updates.targetPerDay ?? updates.total ?? updates.dailyGoal ?? 0),
  reminder: Boolean(updates.reminder),
  timeOfDay: updates.timeOfDay ?? updates.timeRange ?? 'Morgen',
})

export const normalizeHabits = (habits = []) => habits.map(normalizeHabit)

export const readStoredHabits = () => {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? normalizeHabits(JSON.parse(stored)) : []
  } catch (error) {
    console.error('Unable to read stored habits', error)
    return []
  }
}

export const writeStoredHabits = (habits = []) => {
  if (typeof window === 'undefined') return []

  const normalized = normalizeHabits(habits)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export const clearStoredHabits = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
