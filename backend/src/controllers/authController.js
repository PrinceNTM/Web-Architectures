import bcrypt from 'bcrypt'
import prisma from '../prisma.js'
import { setAuthCookie, clearAuthCookie } from '../utils/authSession.js'
import { validatePassword } from '../utils/validatePassword.js'

const BCRYPT_SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)

const invalidCredentialsResponse = (res) =>
  res.status(401).json({ error: 'E-Mail oder Passwort ungültig.' })

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich.' })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Passwort erfuellt die Mindestanforderungen nicht.' })
    }

    const normalizedEmail = email.toLowerCase()
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (existingUser) {
      return res.status(409).json({ error: 'E-Mail bereits vergeben.' })
    }

    const saltRounds = Number.isInteger(BCRYPT_SALT_ROUNDS) && BCRYPT_SALT_ROUNDS >= 12
      ? BCRYPT_SALT_ROUNDS
      : 12

    const hashedPassword = await bcrypt.hash(password, saltRounds)
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

    setAuthCookie(res, { userId: user.id, email: user.email })
    return res.json({ id: user.id, email: user.email })
  } catch (error) {
    next(error)
  }
}

export const me = async (req, res) => {
  return res.json({ id: req.user.userId, email: req.user.email })
}

export const logout = async (req, res) => {
  clearAuthCookie(res)
  return res.json({ success: true })
}
