// In-memory database for now (will be replaced with proper DB)
let habits = []
let checkins = []

export const habitModel = {
  findAll: () => habits,
  findById: (id) => habits.find(h => h.id === id),
  create: (data) => {
    const habit = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
    }
    habits.push(habit)
    return habit
  },
  update: (id, data) => {
    const index = habits.findIndex(h => h.id === id)
    if (index !== -1) {
      habits[index] = { ...habits[index], ...data }
      return habits[index]
    }
    return null
  },
  delete: (id) => {
    const index = habits.findIndex(h => h.id === id)
    if (index !== -1) {
      habits.splice(index, 1)
      return true
    }
    return false
  },
}

export const checkinModel = {
  createCheckin: (habitId, date) => {
    const checkin = {
      id: Date.now().toString(),
      habitId,
      date,
      createdAt: new Date(),
    }
    checkins.push(checkin)
    return checkin
  },
  getCheckins: (habitId) => checkins.filter(c => c.habitId === habitId),
  isCheckedIn: (habitId, date) => {
    return checkins.some(c => c.habitId === habitId && c.date === date)
  },
}
