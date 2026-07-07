import prisma from '../prisma.js'

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
    const { firstName, lastName, email, language } = req.body || {}

    if (!email) {
      return res.status(400).json({ error: 'E-Mail ist erforderlich.' })
    }

    const normalizedEmail = email.toLowerCase()
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
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        language: true,
      },
    })

    return res.json(toUserResponse(updatedUser))
  } catch (error) {
    next(error)
  }
}
