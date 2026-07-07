import { beforeEach, describe, expect, it } from 'vitest'
import { clearStoredUser, normalizeUser, readStoredUser, writeStoredUser } from './profileStorage.js'

describe('profileStorage', () => {
  beforeEach(() => {
    clearStoredUser()
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
})
