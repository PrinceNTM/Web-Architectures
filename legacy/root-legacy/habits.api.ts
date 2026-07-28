import { authFetch } from '../../shared/lib/authFetch';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const habitsApi = {
  async getAll() {
    const res = await authFetch(`${API_URL}/habits`);
    return res.json();
  },

  async getById(id: string) {
    const res = await authFetch(`${API_URL}/habits/${id}`);
    if (!res.ok) throw new Error('Habit nicht gefunden');
    return res.json();
  },

  async create(data: { name: string; category?: string; description?: string }) {
    const res = await authFetch(`${API_URL}/habits`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async update(id: string, data: any) {
    const res = await authFetch(`${API_URL}/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(id: string) {
    await authFetch(`${API_URL}/habits/${id}`, { method: 'DELETE' });
  },

  async checkIn(habitId: string, date?: string) {
    const res = await authFetch(`${API_URL}/habits/${habitId}/checkin`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
    return res.json();
  }
};