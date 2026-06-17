import prisma from '../prisma.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Erstellt ein neues Habit.
 * Enthält ausschließlich Geschäftslogik und kennt keine HTTP-Objekte.
 * 
 * @param {Object} data - Die Habit-Daten (name, category, description).
 * @param {string} userId - Die ID des Besitzers.
 * @returns {Promise<Object>} Das erstellte Habit.
 * @throws {ValidationError} Wenn die Validierung fehlschlägt.
 */
export const createHabit = async (data, userId) => {
  const { name, category, description } = data;

  // 1. Validierung (Domain-Regel)
  if (!name || name.trim() === '') {
    throw new ValidationError('Ein Name für das Habit ist erforderlich.');
  }

  // 2. Prisma-Query (Datenzugriff)
  return await prisma.habit.create({
    data: {
      name,
      category,
      description,
      userId
    }
  });
};