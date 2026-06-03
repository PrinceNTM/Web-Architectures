import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.js'

const JWT_SECRET = process.env.JWT_SECRET
const TOKEN_NAME = 'token'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
}

const invalidCredentialsResponse = (res) =>
  res.status(401).json({ error: 'E-Mail oder Passwort ungültig.' })

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich.' })
    }

    const normalizedEmail = email.toLowerCase()
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (existingUser) {
      return res.status(409).json({ error: 'E-Mail bereits vergeben.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
      },
    })

    return res.status(201).json({ id: user.id, email: user.email })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return invalidCredentialsResponse(res)
    }

    const normalizedEmail = email.toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (!user) {
      return invalidCredentialsResponse(res)
    }

    const passwordMatches = await bcrypt.compare(password, user.password)
    if (!passwordMatches) {
      return invalidCredentialsResponse(res)
    }

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' },
    )

    res.cookie(TOKEN_NAME, token, COOKIE_OPTIONS)
    return res.json({ id: user.id, email: user.email })
  } catch (error) {
    next(error)
  }
}

export const me = async (req, res) => {
  return res.json({ id: req.user.userId, email: req.user.email })
}

export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
  return res.json({ success: true })
}

export const getSSEToken = (req, res) => {
  // Gibt einen JWT-Token zurück, der mit EventSource verwendet werden kann
  // Wird über Query-Parameter übermittelt
  const token = jwt.sign(
    {
      userId: req.user.userId,
      email: req.user.email,
    },
    JWT_SECRET,
    { expiresIn: '24h' },
  )
  return res.json({ token })
}
