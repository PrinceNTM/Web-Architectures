import prisma from '../prisma.js';
import { enqueueEmail } from '../emails/emailQueue.js';
import { broadcastEvent } from '../utils/sseManager.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';

export const getAllHabits = async (userId) => {
  return await prisma.habit.findMany({
    where: { userId },
    include: { entries: true }
  });
};

export const getHabitById = async (id, userId) => {
  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit) {
    throw new NotFoundError('Gewohnheit nicht gefunden.');
  }
  if (habit.userId !== userId) {
    throw new ForbiddenError('Zugriff verweigert.');
  }
  return habit;
};

export const createHabit = async (data, userId) => {
  if (!data.name || data.name.trim() === '') {
    throw new ValidationError('Name ist erforderlich.');
  }
  if (data.name.length > 255) { // Example for an edge case validation
    throw new ValidationError('Name ist zu lang (max. 255 Zeichen).');
  }

  const habit = await prisma.habit.create({
    data: { ...data, userId }
  });

  const owner = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  
  // Side-Effects gekapselt im Service
  enqueueEmail({
    type: 'habit_created',
    to: owner?.email,
    habitName: habit.name,
    createdAt: habit.createdAt,
    appUrl: process.env.FRONTEND_URL || 'https://localhost:5173',
    habitId: habit.id,
  });
  broadcastEvent(userId, 'habit-created', habit);
  
  return habit;
};

export const updateHabit = async (id, data, userId) => {
  // Validierung via getHabitById (Ownership-Check)
  await getHabitById(id, userId);

  if (!data.name || data.name.trim() === '') {
    throw new ValidationError('Name ist erforderlich.');
  }
  if (data.name.length > 255) { // Example for an edge case validation
    throw new ValidationError('Name ist zu lang (max. 255 Zeichen).');
  }

  return await prisma.habit.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category
    },
    include: { entries: true }
  });
};

export const deleteHabit = async (id, userId) => {
  await getHabitById(id, userId);
  return await prisma.habit.delete({ where: { id } });
};