import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Global response interceptor: on 401, call logout to clear server cookie and redirect to /login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    if (status === 401) {
      try {
        await api.post('/auth/logout')
      } catch (e) {
        // ignore
      }
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Habit endpoints
export const habitAPI = {
  getAll: () => api.get('/habits'),
  getById: (id) => api.get(`/habits/${id}`),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
  checkOff: (habitId, date) => api.post(`/habits/${habitId}/checkin`, { date }),
  getCheckins: (habitId) => api.get(`/habits/${habitId}/checkins`),
}

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

export default api
