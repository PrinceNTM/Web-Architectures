import prisma from '../prisma.js'

export const habitModel = {
  findAll: async () => {
    return await prisma.habit.findMany({
      include: {
        entries: true
      }
    })
  },

  findById: async (id) => {
    return await prisma.habit.findUnique({
      where: { id },
      include: {
        entries: true
      }
    })
  },

  create: async (data) => {
    return await prisma.habit.create({
      data: {
        name: data.name,
        category: data.category
      },
      include: {
        entries: true
      }
    })
  },

  update: async (id, data) => {
    try {
      return await prisma.habit.update({
        where: { id },
        data: {
          name: data.name,
          category: data.category
        },
        include: {
          entries: true
        }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        return null // Habit not found
      }
      throw error
    }
  },

  delete: async (id) => {
    try {
      await prisma.habit.delete({
        where: { id }
      })
      return true
    } catch (error) {
      if (error.code === 'P2025') {
        return false // Habit not found
      }
      throw error
    }
  },
}

export const checkinModel = {
  createCheckin: async (habitId, date) => {
    return await prisma.entry.create({
      data: {
        habitId,
        date,
        value: 1
      }
    })
  },

  getCheckins: async (habitId) => {
    return await prisma.entry.findMany({
      where: { habitId }
    })
  },

  isCheckedIn: async (habitId, date) => {
    const entry = await prisma.entry.findFirst({
      where: {
        habitId,
        date
      }
    })
    return !!entry
  },
}
