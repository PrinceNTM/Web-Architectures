const STORAGE_KEY = 'habit-tracker-user'
const MEMORY_STORE = Symbol.for('habit-tracker-user-store')

const getStorage = () => {
  if (typeof globalThis !== 'undefined') {
    if (!globalThis[MEMORY_STORE]) {
      globalThis[MEMORY_STORE] = {}
    }
    return globalThis[MEMORY_STORE]
  }

  return null
}

export const DEFAULT_PROFILE = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  language: 'Deutsch',
}

export const normalizeUser = (user = {}) => ({
  id: user.id || '',
  email: user.email || '',
  firstName: user.firstName || '',
  lastName: user.lastName || '',
  language: user.language || 'Deutsch',
})

export const writeStoredUser = (user) => {
  const storage = getStorage()
  if (!storage) return null

  const normalized = normalizeUser(user)
  storage.setItem?.(STORAGE_KEY, JSON.stringify(normalized))
  if (typeof storage === 'object' && !storage.setItem) {
    storage[STORAGE_KEY] = JSON.stringify(normalized)
  }
  return normalized
}

export const readStoredUser = () => {
  const storage = getStorage()
  if (!storage) return null

  try {
    const stored = storage.getItem?.(STORAGE_KEY) ?? storage[STORAGE_KEY]
    return stored ? normalizeUser(JSON.parse(stored)) : null
  } catch {
    return null
  }
}

export const clearStoredUser = () => {
  const storage = getStorage()
  if (!storage) return

  storage.removeItem?.(STORAGE_KEY)
  if (typeof storage === 'object' && !storage.removeItem) {
    delete storage[STORAGE_KEY]
  }
}
