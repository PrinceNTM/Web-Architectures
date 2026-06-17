import { useState, useEffect, useCallback } from 'react';
import { habitsApi } from './habits.api';

export const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await habitsApi.getAll();
      setHabits(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addHabit = async (name: string, category?: string) => {
    try {
      const newHabit = await habitsApi.create({ name, category });
      setHabits((prev) => [newHabit, ...prev]);
      return newHabit;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleCheckIn = async (habitId: string) => {
    try {
      await habitsApi.checkIn(habitId);
      await fetchHabits(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return {
    habits,
    loading,
    error,
    addHabit,
    toggleCheckIn,
    refresh: fetchHabits
  };
};