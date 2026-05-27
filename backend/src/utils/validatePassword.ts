export function validatePassword(pwd: unknown): boolean {
  if (typeof pwd !== 'string') throw new TypeError('Password must be a string')
  const trimmed = pwd.trim()
  if (trimmed.length < 8) return false
  // at least one letter and one number
  const hasLetter = /[A-Za-z]/.test(trimmed)
  const hasNumber = /[0-9]/.test(trimmed)
  return hasLetter && hasNumber
}

export default validatePassword
