const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

function buildUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

export default async function authFetch(url, options = {}) {
  const opts = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  }

  const res = await fetch(buildUrl(url), opts)

  if (res.status === 401) {
    try {
      // Attempt server-side logout to clear HttpOnly cookie
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      // ignore
    }
    // Redirect to login
    window.location.href = '/login'
    // Return a rejected promise so callers can handle if needed
    return Promise.reject(new Error('Unauthorized'))
  }

  return res
}
