import prisma from '../prisma.js'
import bcrypt from 'bcrypt'
import { setAuthCookie } from '../utils/authSession.js'

const toUserResponse = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName ?? '',
  lastName: user.lastName ?? '',
  language: user.language ?? 'Deutsch',
})

export const getCurrentUserProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        language: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User nicht gefunden.' })
    }

    return res.json(toUserResponse(user))
  } catch (error) {
    next(error)
  }
}

export const updateUserProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, language, currentPassword } = req.body || {}

    if (!email) {
      return res.status(400).json({ error: 'E-Mail ist erforderlich.' })
    }

    const normalizedEmail = email.toLowerCase()
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        password: true,
        tokenVersion: true,
      },
    })

    if (!currentUser) {
      return res.status(404).json({ error: 'User nicht gefunden.' })
    }

    const emailChanged = normalizedEmail !== currentUser.email

    if (emailChanged) {
      const passwordMatches = currentPassword
        ? await bcrypt.compare(currentPassword, currentUser.password)
        : false

      if (!passwordMatches) {
        return res.status(401).json({ error: 'Aktuelles Passwort ungueltig.' })
      }
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        NOT: {
          id: req.user.userId,
        },
      },
    })

    if (existingUser) {
      return res.status(409).json({ error: 'E-Mail bereits vergeben.' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        firstName: firstName?.trim() ?? '',
        lastName: lastName?.trim() ?? '',
        email: normalizedEmail,
        language: language ?? 'Deutsch',
        ...(emailChanged ? { tokenVersion: { increment: 1 } } : {}),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        language: true,
        tokenVersion: true,
      },
    })

    if (emailChanged) {
      setAuthCookie(res, { userId: updatedUser.id, email: updatedUser.email, tokenVersion: updatedUser.tokenVersion })
    }

    return res.json(toUserResponse(updatedUser))
  } catch (error) {
    next(error)
  }
}
