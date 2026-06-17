import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../utils/errors.js';

const prisma = new PrismaClient();

/**
 * Erstellt ein neues Habit für einen bestimmten Benutzer.
 * @param {object} data - Die Daten für das neue Habit (name, description, category).
 * @param {string} userId - Die ID des Benutzers, dem das Habit gehört.
 * @returns {Promise<object>} Das neu erstellte Habit-Objekt.
 * @throws {ValidationError} Wenn der Name des Habits fehlt.
 * @throws {Error} Bei anderen Datenbank- oder Service-Fehlern.
 */
export const createHabit = async (data, userId) => {
  const { name, description, category } = data;

  if (!name || name.trim() === '') {
    throw new ValidationError('Ein Name für das Habit ist erforderlich.');
  }

  return await prisma.habit.create({
    data: {
      name,
      description,
      category,
      userId: userId,
    },
  });
};

/**
 * Ruft ein Habit anhand seiner ID und der Benutzer-ID ab.
 * @param {string} id - Die ID des Habits.
 * @param {string} userId - Die ID des Benutzers, dem das Habit gehört.
 * @returns {Promise<object>} Das Habit-Objekt.
 * @throws {Error} Wenn das Habit nicht gefunden wird (mit statusCode 404).
 */
export const getHabitById = async (id, userId) => {
  const habit = await prisma.habit.findFirst({
    where: { id, userId },
    include: { entries: true }, // Annahme: Entries sollen mitgeladen werden
  });
  if (!habit) {
    const error = new Error('Habit nicht gefunden.');
    error.statusCode = 404; // Custom property for controller to pick up
    throw error;
  }
  return habit;
};

/**
 * Ruft ein Habit anhand seiner ID und der Benutzer-ID ab.
 * (Weitere Implementierung folgt im nächsten Schritt, falls benötigt)
 */
// export const getHabitById = async (id, userId) => { /* ... */ };