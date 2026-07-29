import { describe, it, expect } from 'vitest'
import { validatePassword } from './validatePassword'

const VALID_PASSWORD = `MyGreatPassphrase-${Date.now()}-2026`

describe('validatePassword', () => {
  it('Normalfall: gültiges Passwort', () => {
    expect(validatePassword(VALID_PASSWORD)).toBe(true)
  })

  it('Leerer Input / kurzer Input', () => {
    expect(validatePassword('')).toBe(false)
    expect(validatePassword('P1a')).toBe(false)
    expect(validatePassword('1234567890')).toBe(false)
    expect(validatePassword('       ')).toBe(false)
  })

  it('Ungültiger Typ führt zu TypeError', () => {
    // @ts-ignore
    expect(() => validatePassword(null)).toThrow(TypeError)
    // @ts-ignore
    expect(() => validatePassword(12345678)).toThrow(TypeError)
  })
})
