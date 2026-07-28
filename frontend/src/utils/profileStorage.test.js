import { beforeEach, describe, expect, it } from 'vitest'
import { clearStoredUser, normalizeUser, readStoredUser, writeStoredUser } from './profileStorage.js'

const STORAGE_KEY = 'habit-tracker-user'
const MEMORY_STORE = Symbol.for('habit-tracker-user-store')

describe('profileStorage', () => {
  beforeEach(() => {
    clearStoredUser()
    delete globalThis[MEMORY_STORE]
  })

  it('normalizes an incoming user object for storage', () => {
    expect(normalizeUser({ id: '1', email: 'user@example.com' })).toEqual({
      id: '1',
      email: 'user@example.com',
      firstName: '',
      lastName: '',
      language: 'Deutsch',
    })
  })

  it('persists and reads a user profile from localStorage', () => {
    const user = normalizeUser({
      id: '1',
      email: 'user@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      language: 'English',
    })

    writeStoredUser(user)

    expect(readStoredUser()).toEqual(user)
  })

  it('returns null for malformed stored user JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{invalid-json')

    expect(readStoredUser()).toBeNull()
  })

  it('uses in-memory fallback store when localStorage is unavailable', () => {
    const originalWindow = globalThis.window
    globalThis.window = undefined

    try {
      const user = normalizeUser({ id: '2', email: 'fallback@example.com' })
      writeStoredUser(user)

      expect(globalThis[MEMORY_STORE][STORAGE_KEY]).toBeDefined()
      expect(readStoredUser()).toEqual(user)

      clearStoredUser()
      expect(globalThis[MEMORY_STORE][STORAGE_KEY]).toBeUndefined()
    } finally {
      globalThis.window = originalWindow
    }
  })
})
