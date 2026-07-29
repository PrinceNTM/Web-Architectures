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

  it('persists and reads a user profile from the in-memory store', () => {
    const user = normalizeUser({
      id: '1',
      email: 'user@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      language: 'English',
    })

    writeStoredUser(user)

    expect(globalThis[MEMORY_STORE][STORAGE_KEY]).toBeDefined()
    expect(readStoredUser()).toEqual(user)
  })

  it('returns null for malformed stored user JSON', () => {
    globalThis[MEMORY_STORE] = { [STORAGE_KEY]: '{invalid-json' }

    expect(readStoredUser()).toBeNull()
  })

  it('clears a stored user from the in-memory store', () => {
    const user = normalizeUser({ id: '2', email: 'fallback@example.com' })
    writeStoredUser(user)

    clearStoredUser()

    expect(globalThis[MEMORY_STORE][STORAGE_KEY]).toBeUndefined()
  })
})
