import jwt from 'jsonwebtoken'

export const TOKEN_NAME = 'token'

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
}

export const signSessionToken = ({ userId, email, tokenVersion = 0 }) => {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.sign(
    {
      userId,
      email,
      tokenVersion,
    },
    jwtSecret,
    { expiresIn: '24h', algorithm: 'HS256' },
  )
}

export const setAuthCookie = (res, user) => {
  const token = signSessionToken(user)
  res.cookie(TOKEN_NAME, token, COOKIE_OPTIONS)
  return token
}

export const clearAuthCookie = (res) => {
  res.clearCookie(TOKEN_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  })
}