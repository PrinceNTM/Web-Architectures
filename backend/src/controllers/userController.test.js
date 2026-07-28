import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindUnique = vi.fn()
const mockFindFirst = vi.fn()
const mockUpdate = vi.fn()

vi.mock('../prisma.js', () => ({
  default: {
    user: {
      findUnique: (...args) => mockFindUnique(...args),
      findFirst: (...args) => mockFindFirst(...args),
      update: (...args) => mockUpdate(...args),
    },
  },
}))

import { getCurrentUserProfile, updateUserProfile } from './userController.js'

const createRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
})

describe('userController', () => {
  beforeEach(() => {
    mockFindUnique.mockReset()
    mockFindFirst.mockReset()
    mockUpdate.mockReset()
  })

  it('returns current profile for authenticated user', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      firstName: null,
      lastName: null,
      language: null,
    })
    const req = { user: { userId: 'u1' } }
    const res = createRes()
    const next = vi.fn()

    await getCurrentUserProfile(req, res, next)

    expect(res.json).toHaveBeenCalledWith({
      id: 'u1',
      email: 'test@example.com',
      firstName: '',
      lastName: '',
      language: 'Deutsch',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 404 when user is missing', async () => {
    mockFindUnique.mockResolvedValue(null)
    const req = { user: { userId: 'u1' } }
    const res = createRes()
    const next = vi.fn()

    await getCurrentUserProfile(req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'User nicht gefunden.' })
    expect(next).not.toHaveBeenCalled()
  })

  it('forwards db errors in getCurrentUserProfile via next()', async () => {
    const dbError = new Error('db down')
    mockFindUnique.mockRejectedValue(dbError)
    const req = { user: { userId: 'u1' } }
    const res = createRes()
    const next = vi.fn()

    await getCurrentUserProfile(req, res, next)

    expect(next).toHaveBeenCalledWith(dbError)
  })

  it('returns 400 when email is missing in update', async () => {
    const req = { user: { userId: 'u1' }, body: { firstName: 'A' } }
    const res = createRes()
    const next = vi.fn()

    await updateUserProfile(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'E-Mail ist erforderlich.' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 409 when normalized email is already used', async () => {
    mockFindFirst.mockResolvedValue({ id: 'u2' })
    const req = {
      user: { userId: 'u1' },
      body: { email: 'Taken@Example.com', firstName: 'A', lastName: 'B' },
    }
    const res = createRes()
    const next = vi.fn()

    await updateUserProfile(req, res, next)

    expect(mockFindFirst).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ error: 'E-Mail bereits vergeben.' })
    expect(next).not.toHaveBeenCalled()
  })

  it('updates and normalizes profile values', async () => {
    mockFindFirst.mockResolvedValue(null)
    mockUpdate.mockResolvedValue({
      id: 'u1',
      email: 'new@example.com',
      firstName: 'Max',
      lastName: 'Mustermann',
      language: 'Deutsch',
    })
    const req = {
      user: { userId: 'u1' },
      body: {
        email: 'NEW@EXAMPLE.COM',
        firstName: ' Max ',
        lastName: ' Mustermann ',
      },
    }
    const res = createRes()
    const next = vi.fn()

    await updateUserProfile(req, res, next)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'new@example.com',
          firstName: 'Max',
          lastName: 'Mustermann',
          language: 'Deutsch',
        }),
      }),
    )
    expect(res.json).toHaveBeenCalledWith({
      id: 'u1',
      email: 'new@example.com',
      firstName: 'Max',
      lastName: 'Mustermann',
      language: 'Deutsch',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('forwards db errors in updateUserProfile via next()', async () => {
    mockFindFirst.mockResolvedValue(null)
    const dbError = new Error('update failed')
    mockUpdate.mockRejectedValue(dbError)
    const req = { user: { userId: 'u1' }, body: { email: 'a@b.com' } }
    const res = createRes()
    const next = vi.fn()

    await updateUserProfile(req, res, next)

    expect(next).toHaveBeenCalledWith(dbError)
  })
})
