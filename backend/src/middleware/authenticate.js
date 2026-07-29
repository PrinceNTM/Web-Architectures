import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger.js'
import { TOKEN_NAME } from '../utils/authSession.js'
import prisma from '../prisma.js'

const JWT_SECRET = process.env.JWT_SECRET
const UNAUTHORIZED_ERROR = { error: 'Nicht autorisiert.' }

export const authenticate = async (req, res, next) => {
  const token = req.cookies?.[TOKEN_NAME]

  if (!token) {
    return res.status(401).json(UNAUTHORIZED_ERROR)
  }

  if (!JWT_SECRET) {
    logger.error('auth.jwt_secret_missing')
    return res.status(500).json({ error: 'Serverkonfiguration fehlerhaft.' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, tokenVersion: true },
    })

    if (!user || payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).json(UNAUTHORIZED_ERROR)
    }

    req.user = {
      userId: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    }
    next()
  } catch (error) {
    return res.status(401).json(UNAUTHORIZED_ERROR)
  }
}
