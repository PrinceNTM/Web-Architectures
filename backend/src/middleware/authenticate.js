import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
const TOKEN_NAME = 'token'

export const authenticate = (req, res, next) => {
  const token = req.cookies?.[TOKEN_NAME]

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = {
      userId: payload.userId,
      email: payload.email,
    }
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
