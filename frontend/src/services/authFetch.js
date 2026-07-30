const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

function buildUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

/** Read the signed CSRF token issued by the backend cookie. */
function getCsrfToken() {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export default async function authFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const csrfHeaders = STATE_CHANGING_METHODS.has(method)
    ? { 'x-csrf-token': getCsrfToken() }
    : {}

  const opts = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...csrfHeaders,
      ...(options.headers || {}),
    },
    ...options,
  }

  const res = await fetch(buildUrl(url), opts)

  if (res.status === 401) {
    try {
      // Attempt server-side logout to clear HttpOnly cookie
      await fetch(buildUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-csrf-token': getCsrfToken(),
        },
      })
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
