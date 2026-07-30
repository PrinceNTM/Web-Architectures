import axios from 'axios'

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// If the app is opened via an external browser on a different hostname/IP,
// dynamically adjust the API URL to use the current hostname/IP.
if (typeof window !== 'undefined' && window.location) {
  const { hostname, protocol, origin } = window.location
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
      const backendPort = '3000'
      if (hostname.includes('5173')) {
        API_BASE_URL = `${protocol}//${hostname.replace('5173', backendPort)}/api`
      } else if (origin.includes('5173')) {
        API_BASE_URL = origin.replace('5173', backendPort) + '/api'
      } else {
        API_BASE_URL = `${protocol}//${hostname}:${backendPort}/api`
      }
    }
  }
}

/** Read the signed CSRF token issued by the backend cookie. */
const getCsrfToken = () => {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach signed CSRF token before every state-changing request.
api.interceptors.request.use((config) => {
  const method = (config.method || '').toUpperCase()
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    config.headers['x-csrf-token'] = getCsrfToken()
  }
  return config
})

// Global response interceptor: on 401, redirect to /login
// Skip auth endpoints to avoid infinite loops (e.g. /user/me on initial load, /auth/logout itself)
const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/me',
  '/auth/logout',
  '/user/me',
  '/user/profile',
]

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const requestUrl = error?.config?.url || ''
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep))

    if (status === 401 && !isAuthEndpoint) {
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
  checkOff: (habitId, date) => api.post(`/habits/${habitId}/checkins`, { date }),
  uncheck: (habitId, date) => api.delete(`/habits/${habitId}/checkins`, { params: { date } }),
  getCheckins: (habitId) => api.get(`/habits/${habitId}/checkins`),
  resetCheckins: (date) => api.post('/habits/checkins/reset', { date }),
}

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/user/me'),
  getProfile: () => api.get('/user/me'),
  updateProfile: (data) => api.put('/user/profile', data),
  logout: () => api.post('/auth/logout'),
}

export default api
