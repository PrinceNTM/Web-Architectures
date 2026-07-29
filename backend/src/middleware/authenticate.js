import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger.js'
import { TOKEN_NAME } from '../utils/authSession.js'

const JWT_SECRET = process.env.JWT_SECRET
const UNAUTHORIZED_ERROR = { error: 'Nicht autorisiert.' }

export const authenticate = (req, res, next) => {
  const token = req.cookies?.[TOKEN_NAME]

  if (!token) {
    return res.status(401).json(UNAUTHORIZED_ERROR)
  }

  if (!JWT_SECRET) {
    logger.error('auth.jwt_secret_missing')
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
