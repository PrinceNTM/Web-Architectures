import prisma from '../prisma.js';

/**
 * Erstellt einen neuen Check-in Eintrag.
 */
export const createEntry = async (habitId, date, value = 1) => {
  return await prisma.entry.create({
    data: {
      habitId,
      date: date || new Date().toISOString().split('T')[0],
      value
    }
  });
};

/**
 * Liefert alle Check-ins für ein bestimmtes Habit.
 */
export const getEntriesByHabitId = async (habitId) => {
  return await prisma.entry.findMany({
    where: { habitId }
  });
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
