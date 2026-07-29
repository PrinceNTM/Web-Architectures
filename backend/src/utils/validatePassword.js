export function validatePassword(pwd) {
  if (typeof pwd !== 'string') throw new TypeError('Password must be a string')
  const trimmed = pwd.trim()
  if (trimmed.length < 8) return false
  const hasLetter = /[A-Za-z]/.test(trimmed)
  const hasNumber = /[0-9]/.test(trimmed)
  return hasLetter && hasNumber
}

export default validatePassword