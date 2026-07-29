import prisma from '../prisma.js';

const formatDate = (date) => {
  if (date) return date
  return new Date().toISOString().split('T')[0]
}

/**
 * Erstellt einen neuen Check-in Eintrag.
 */
export const createEntry = async (habitId, userId, date, value = 1) => {
  const normalizedDate = formatDate(date)

  const existing = await prisma.entry.findFirst({
    where: {
      habitId,
      date: normalizedDate,
      habit: { userId },
    },
  })

  if (existing) {
    return existing
  }

  return await prisma.entry.create({
    data: {
      habitId,
      date: normalizedDate,
      value,
    },
  })
};

/**
 * Löscht einen Check-in Eintrag.
 */
export const deleteEntry = async (habitId, userId, date) => {
  const normalizedDate = formatDate(date)

  return await prisma.entry.deleteMany({
    where: {
      habitId,
      date: normalizedDate,
      habit: { userId },
    },
  })
};

/**
 * Liefert alle Check-ins für ein bestimmtes Habit.
 */
export const getEntriesByHabitId = async (habitId, userId) => {
  return await prisma.entry.findMany({
    where: {
      habitId,
      habit: { userId },
    },
    orderBy: { date: 'asc' },
  })
};

/**
 * Löscht alle Check-ins für ein bestimmtes Datum.
 */
export const deleteEntriesByDate = async (date, userId) => {
  const normalizedDate = formatDate(date)

  return await prisma.entry.deleteMany({
    where: {
      date: normalizedDate,
      habit: { userId },
    },
  })
};

/**
 * Liefert alle Einträge für einen bestimmten Zeitraum.
 */
export const getEntriesForPeriod = async (userId, from, to) => {
  return await prisma.entry.findMany({
    where: {
      date: { gte: from, lte: to },
      habit: { userId: userId }
    },
    include: { habit: true }
  });
};
