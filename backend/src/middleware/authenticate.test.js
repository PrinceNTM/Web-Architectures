import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockVerify = vi.fn()
const mockFindUnique = vi.fn()

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: (...args) => mockVerify(...args),
  },
}))

vi.mock('../prisma.js', () => ({
  default: {
    user: {
      findUnique: (...args) => mockFindUnique(...args),
    },
  },
}))

const createRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
})

describe('authenticate middleware', () => {
  beforeEach(() => {
    vi.resetModules()
    mockVerify.mockReset()
    mockFindUnique.mockReset()
    process.env.JWT_SECRET = 'test-secret'
  })

  it('returns 401 when no token is provided', async () => {
    const { authenticate } = await import('./authenticate.js')
    const req = { cookies: {}, query: {} }
    const res = createRes()
    const next = vi.fn()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Nicht autorisiert.' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 500 when JWT secret is missing', async () => {
    delete process.env.JWT_SECRET
    const { authenticate } = await import('./authenticate.js')
    const req = { cookies: { token: 'abc' }, query: {} }
    const res = createRes()
    const next = vi.fn()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Serverkonfiguration fehlerhaft.' })
    expect(next).not.toHaveBeenCalled()
  })

  it('sets req.user and calls next when token is valid', async () => {
    mockVerify.mockReturnValue({ userId: 'u1', email: 'user@example.com', tokenVersion: 2 })
    mockFindUnique.mockResolvedValue({ id: 'u1', email: 'user@example.com', tokenVersion: 2 })
    const { authenticate } = await import('./authenticate.js')
    const req = { cookies: { token: 'valid-token' }, query: {} }
    const res = createRes()
    const next = vi.fn()

    await authenticate(req, res, next)

    expect(mockVerify).toHaveBeenCalledWith('valid-token', 'test-secret', { algorithms: ['HS256'] })
    expect(req.user).toEqual({ userId: 'u1', email: 'user@example.com', tokenVersion: 2 })
    expect(next).toHaveBeenCalled()
  })

  it('returns 401 when tokenVersion differs from current user version', async () => {
    mockVerify.mockReturnValue({ userId: 'u1', email: 'user@example.com', tokenVersion: 1 })
    mockFindUnique.mockResolvedValue({ id: 'u1', email: 'user@example.com', tokenVersion: 2 })
    const { authenticate } = await import('./authenticate.js')
    const req = { cookies: { token: 'stale-token' }, query: {} }
    const res = createRes()
    const next = vi.fn()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Nicht autorisiert.' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when token verification fails', async () => {
    mockVerify.mockImplementation(() => {
      throw new Error('invalid token')
    })
    const { authenticate } = await import('./authenticate.js')
    const req = { cookies: { token: 'bad-token' }, query: {} }
    const res = createRes()
    const next = vi.fn()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Nicht autorisiert.' })
    expect(next).not.toHaveBeenCalled()
  })
})
