import prisma from '../prisma.js';

const formatDate = (date) => {
  if (date) return date
  return new Date().toISOString().split('T')[0]
}

/**
 * Erstellt einen neuen Check-in Eintrag.
 */
export const createEntry = async (habitId, date, value = 1) => {
  const normalizedDate = formatDate(date)

  const existing = await prisma.entry.findFirst({
    where: {
      habitId,
      date: normalizedDate,
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
export const deleteEntry = async (habitId, date) => {
  const normalizedDate = formatDate(date)

  return await prisma.entry.deleteMany({
    where: {
      habitId,
      date: normalizedDate,
    },
  })
};

/**
 * Liefert alle Check-ins für ein bestimmtes Habit.
 */
export const getEntriesByHabitId = async (habitId) => {
  return await prisma.entry.findMany({
    where: { habitId },
    orderBy: { date: 'asc' },
  })
};

/**
 * Löscht alle Check-ins für ein bestimmtes Datum.
 */
export const deleteEntriesByDate = async (date) => {
  const normalizedDate = formatDate(date)

  return await prisma.entry.deleteMany({
    where: { date: normalizedDate },
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
