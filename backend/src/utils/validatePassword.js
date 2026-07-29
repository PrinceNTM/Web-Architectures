import zxcvbn from 'zxcvbn'

export function validatePassword(pwd) {
  if (typeof pwd !== 'string') throw new TypeError('Password must be a string')
  const trimmed = pwd.trim()
  if (trimmed.length < 10) return false

  const analysis = zxcvbn(trimmed)
  return analysis.score >= 3
}

export default validatePassword