// backend/src/services/habits.service.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllHabits, getHabitById, createHabit, updateHabit, deleteHabit } from './habits.service.js';
import prisma from '../prisma.js';
import { enqueueEmail } from '../emails/emailQueue.js';
import { broadcastEvent } from '../utils/sseManager.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';

// Mock Prisma Client
vi.mock('../prisma.js', () => ({
  default: {
    habit: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock side effects
vi.mock('../emails/emailQueue.js', () => ({
  enqueueEmail: vi.fn(),
}));
vi.mock('../utils/sseManager.js', () => ({
  broadcastEvent: vi.fn(),
}));

describe('Habits Service', () => {
  const mockUserId = 'user123';
  const mockHabitId = 'habit123';
  const mockHabit = {
    id: mockHabitId,
    name: 'Test Habit',
    category: 'Health',
    userId: mockUserId,
    entries: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- getAllHabits tests ---
  it('should return all habits for a user (normal case)', async () => {
    prisma.habit.findMany.mockResolvedValue([mockHabit]);
    const habits = await getAllHabits(mockUserId);
    expect(habits).toEqual([mockHabit]);
    expect(prisma.habit.findMany).toHaveBeenCalledWith({
      where: { userId: mockUserId },
      include: { entries: true },
    });
  });

  it('should return an empty array if no habits are found (normal case)', async () => {
    prisma.habit.findMany.mockResolvedValue([]);
    const habits = await getAllHabits(mockUserId);
    expect(habits).toEqual([]);
  });

  // --- getHabitById tests ---
  it('should return a habit by ID for the correct user (normal case)', async () => {
    prisma.habit.findUnique.mockResolvedValue(mockHabit);
    const habit = await getHabitById(mockHabitId, mockUserId);
    expect(habit).toEqual(mockHabit);
    expect(prisma.habit.findUnique).toHaveBeenCalledWith({ where: { id: mockHabitId } });
  });

  it('should throw NotFoundError if habit is not found (error case)', async () => {
    prisma.habit.findUnique.mockResolvedValue(null);
    await expect(getHabitById('nonexistentId', mockUserId)).rejects.toThrow(NotFoundError);
    await expect(getHabitById('nonexistentId', mockUserId)).rejects.toHaveProperty('statusCode', 404);
  });

  it('should throw ForbiddenError if habit belongs to another user (error case)', async () => {
    prisma.habit.findUnique.mockResolvedValue({ ...mockHabit, userId: 'anotherUser' });
    await expect(getHabitById(mockHabitId, mockUserId)).rejects.toThrow(ForbiddenError);
    await expect(getHabitById(mockHabitId, mockUserId)).rejects.toHaveProperty('statusCode', 403);
  });

  // --- createHabit tests ---
  it('should create a new habit with valid data (normal case)', async () => {
    const newHabitData = { name: 'New Habit', category: 'Work' };
    const createdHabit = { id: 'newHabitId', ...newHabitData, userId: mockUserId };
    prisma.habit.create.mockResolvedValue(createdHabit);

    const result = await createHabit(newHabitData, mockUserId);

    expect(result).toEqual(createdHabit);
    expect(prisma.habit.create).toHaveBeenCalledWith({
      data: {
        name: newHabitData.name,
        category: newHabitData.category,
        userId: mockUserId,
      },
    });
    expect(enqueueEmail).toHaveBeenCalledWith({ type: 'habit-created', data: createdHabit });
    expect(broadcastEvent).toHaveBeenCalledWith(mockUserId, { type: 'habit-created', habit: createdHabit });
  });

  it('should throw ValidationError if name is missing (error case)', async () => {
    const invalidHabitData = { category: 'No name' };
    await expect(createHabit(invalidHabitData, mockUserId)).rejects.toThrow(ValidationError);
    await expect(createHabit(invalidHabitData, mockUserId)).rejects.toHaveProperty('statusCode', 400);
  });

  it('should throw ValidationError if name is empty (error case)', async () => {
    const invalidHabitData = { name: '   ', category: 'Empty name' };
    await expect(createHabit(invalidHabitData, mockUserId)).rejects.toThrow(ValidationError);
    await expect(createHabit(invalidHabitData, mockUserId)).rejects.toHaveProperty('statusCode', 400);
  });

  it('should throw ValidationError if name is too long (edge case)', async () => {
    const longName = 'a'.repeat(256); // Assuming max length 255
    const invalidHabitData = { name: longName };
    await expect(createHabit(invalidHabitData, mockUserId)).rejects.toThrow(ValidationError);
    await expect(createHabit(invalidHabitData, mockUserId)).rejects.toHaveProperty('statusCode', 400);
  });

  // --- updateHabit tests ---
  it('should update an existing habit with valid data (normal case)', async () => {
    const updatedHabitData = { name: 'Updated Habit', category: 'Fitness' };
    const updatedHabit = { ...mockHabit, ...updatedHabitData };

    prisma.habit.findUnique.mockResolvedValue(mockHabit); // For getHabitById ownership check
    prisma.habit.update.mockResolvedValue(updatedHabit);

    const result = await updateHabit(mockHabitId, updatedHabitData, mockUserId);

    expect(result).toEqual(updatedHabit);
    expect(prisma.habit.update).toHaveBeenCalledWith({
      where: { id: mockHabitId },
      data: {
        name: updatedHabitData.name,
        category: updatedHabitData.category,
      },
      include: { entries: true },
    });
  });

  it('should throw NotFoundError if habit to update is not found (error case)', async () => {
    prisma.habit.findUnique.mockResolvedValue(null); // For getHabitById ownership check
    const updateData = { name: 'Nonexistent Update' };
    await expect(updateHabit('nonexistentId', updateData, mockUserId)).rejects.toThrow(NotFoundError);
  });

  it('should throw ForbiddenError if habit to update belongs to another user (error case)', async () => {
    prisma.habit.findUnique.mockResolvedValue({ ...mockHabit, userId: 'anotherUser' }); // For getHabitById ownership check
    const updateData = { name: 'Forbidden Update' };
    await expect(updateHabit(mockHabitId, updateData, mockUserId)).rejects.toThrow(ForbiddenError);
  });

  it('should throw ValidationError if name is missing in update data (error case)', async () => {
    prisma.habit.findUnique.mockResolvedValue(mockHabit); // For getHabitById ownership check
    const invalidUpdateData = { name: '   ' };
    await expect(updateHabit(mockHabitId, invalidUpdateData, mockUserId)).rejects.toThrow(ValidationError);
    await expect(updateHabit(mockHabitId, invalidUpdateData, mockUserId)).rejects.toHaveProperty('statusCode', 400);
  });

  it('should throw ValidationError if name is too long in update data (edge case)', async () => {
    prisma.habit.findUnique.mockResolvedValue(mockHabit); // For getHabitById ownership check
    const longName = 'a'.repeat(256);
    const invalidUpdateData = { name: longName };
    await expect(updateHabit(mockHabitId, invalidUpdateData, mockUserId)).rejects.toThrow(ValidationError);
    await expect(updateHabit(mockHabitId, invalidUpdateData, mockUserId)).rejects.toHaveProperty('statusCode', 400);
  });

  // --- deleteHabit tests ---
  it('should delete an existing habit for the correct user (normal case)', async () => {
    prisma.habit.findUnique.mockResolvedValue(mockHabit); // For getHabitById ownership check
    prisma.habit.delete.mockResolvedValue(mockHabit);

    const result = await deleteHabit(mockHabitId, mockUserId);

    expect(result).toEqual(mockHabit);
    expect(prisma.habit.delete).toHaveBeenCalledWith({ where: { id: mockHabitId } });
  });

  it('should throw NotFoundError if habit to delete is not found (error case)', async () => {
    prisma.habit.findUnique.mockResolvedValue(null); // For getHabitById ownership check
    await expect(deleteHabit('nonexistentId', mockUserId)).rejects.toThrow(NotFoundError);
  });

  it('should throw ForbiddenError if habit to delete belongs to another user (error case)', async () => {
    prisma.habit.findUnique.mockResolvedValue({ ...mockHabit, userId: 'anotherUser' }); // For getHabitById ownership check
    await expect(deleteHabit(mockHabitId, mockUserId)).rejects.toThrow(ForbiddenError);
  });
});
