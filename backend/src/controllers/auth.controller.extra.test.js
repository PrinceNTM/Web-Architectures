import { vi, describe, it, expect, beforeEach } from 'vitest'
import crypto from 'node:crypto'

const TEST_PASSWORD = crypto.randomBytes(24).toString('hex')
const TEST_JWT_SECRET = crypto.randomBytes(32).toString('hex')
const MOCK_PASSWORD_HASH = crypto.randomUUID()
const MOCK_JWT_TOKEN = crypto.randomUUID()

const { mockFindUnique, mockCreate, mockHash, mockCompare, mockSign } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
  mockHash: vi.fn(),
  mockCompare: vi.fn(),
  mockSign: vi.fn(),
}))

vi.mock('../prisma.js', () => ({
  default: {
    user: {
      findUnique: (...args) => mockFindUnique(...args),
      create: (...args) => mockCreate(...args),
    },
  },
}))

vi.mock('bcrypt', () => ({
  default: {
    hash: (...args) => mockHash(...args),
    compare: (...args) => mockCompare(...args),
    hashSync: () => 'mock_dummy_hash',
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: (...args) => mockSign(...args),
  },
}))

const loadController = async () => {
  vi.resetModules()
  process.env.JWT_SECRET = TEST_JWT_SECRET
  return import('./authController.js')
}

const createRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  cookie: vi.fn(),
  clearCookie: vi.fn(),
})

describe('authController extra coverage', () => {
  beforeEach(() => {
    mockFindUnique.mockReset()
    mockCreate.mockReset()
    mockHash.mockReset()
    mockCompare.mockReset()
    mockSign.mockReset()
  })

  it('register returns 400 when required fields are missing', async () => {
    const { register } = await loadController()
    const req = { body: { email: '', password: '' } }
    const res = createRes()
    const next = vi.fn()

    await register(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'E-Mail und Passwort sind erforderlich.' })
  })

  it('register creates user and returns 201', async () => {
    const { register } = await loadController()
    mockFindUnique.mockResolvedValue(null)
    mockHash.mockResolvedValue(MOCK_PASSWORD_HASH)
    mockCreate.mockResolvedValue({ id: 'u1', email: 'user@example.com' })
    const req = { body: { email: 'USER@EXAMPLE.COM', password: TEST_PASSWORD } }
    const res = createRes()
    const next = vi.fn()

    await register(req, res, next)

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'user@example.com' } })
    expect(mockHash).toHaveBeenCalledWith(TEST_PASSWORD, 12)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ id: 'u1', email: 'user@example.com' })
    expect(next).not.toHaveBeenCalled()
  })

  it('login returns 401 for missing credentials', async () => {
    const { login } = await loadController()
    const req = { body: { email: '', password: '' } }
    const res = createRes()
    const next = vi.fn()

    await login(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'E-Mail oder Passwort ungültig.' })
  })

  it('login returns profile and sets cookie when credentials are valid', async () => {
    const { login } = await loadController()
    mockFindUnique.mockResolvedValue({ id: 'u1', email: 'user@example.com', password: MOCK_PASSWORD_HASH })
    mockCompare.mockResolvedValue(true)
    mockSign.mockReturnValue(MOCK_JWT_TOKEN)
    const req = { body: { email: 'user@example.com', password: TEST_PASSWORD } }
    const res = createRes()
    const next = vi.fn()

    await login(req, res, next)

    expect(res.cookie).toHaveBeenCalledWith('token', MOCK_JWT_TOKEN, expect.any(Object))
    expect(res.json).toHaveBeenCalledWith({ id: 'u1', email: 'user@example.com' })
    expect(next).not.toHaveBeenCalled()
  })

  it('me returns authenticated user payload', async () => {
    const { me } = await loadController()
    const req = { user: { userId: 'u1', email: 'user@example.com' } }
    const res = createRes()

    await me(req, res)

    expect(res.json).toHaveBeenCalledWith({ id: 'u1', email: 'user@example.com' })
  })

  it('logout clears cookie and returns success', async () => {
    const { logout } = await loadController()
    const req = {}
    const res = createRes()

    await logout(req, res)

    expect(res.clearCookie).toHaveBeenCalledWith(
      'token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
      }),
    )
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })
})
