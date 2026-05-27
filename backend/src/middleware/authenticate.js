import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
const TOKEN_NAME = 'token'
const UNAUTHORIZED_ERROR = { error: 'Nicht autorisiert.' }

export const authenticate = (req, res, next) => {
  const token = req.cookies?.[TOKEN_NAME]

  if (!token) {
    return res.status(401).json(UNAUTHORIZED_ERROR)
  }

  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured')
    return res.status(500).json({ error: 'Serverkonfiguration fehlerhaft.' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = {
      userId: payload.userId,
      email: payload.email,
    }
    next()
  } catch (error) {
    return res.status(401).json(UNAUTHORIZED_ERROR)
  }
}
