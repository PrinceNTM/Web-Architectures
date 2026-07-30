import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import crypto from 'node:crypto'

// Mocks must be declared before importing the module under test
const mockFindUnique = vi.fn()
const mockCreate = vi.fn()

vi.mock('../prisma.js', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
      create: (...args: any[]) => mockCreate(...args),
    },
  },
}))

const mockCompare = vi.fn()
vi.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    compare: (...args: any[]) => mockCompare(...args),
    hashSync: () => 'mock_dummy_hash',
  },
}))

import { login, register } from './authController.js'

const VALID_TEST_PASSWORD = crypto.randomBytes(24).toString('hex')
const INVALID_TEST_PASSWORD = crypto.randomBytes(24).toString('hex')
const NON_EXISTING_USER_PASSWORD = crypto.randomBytes(24).toString('hex')
const MOCK_PASSWORD_HASH = crypto.randomUUID()

describe('Auth sad path tests', () => {
  beforeEach(() => {
    mockFindUnique.mockReset()
    mockCreate.mockReset()
    mockCompare.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('Login with non-existing email returns 401 with generic message', async () => {
    mockFindUnique.mockResolvedValue(null)

    const req: any = { body: { email: 'notfound@example.com', password: NON_EXISTING_USER_PASSWORD } }
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }

    await login(req, res, vi.fn())

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'E-Mail oder Passwort ungültig.' })
  })

  it('Login with wrong password returns 401 with generic message', async () => {
    mockFindUnique.mockResolvedValue({ id: 'user1', email: 'user@example.com', password: MOCK_PASSWORD_HASH })
    mockCompare.mockResolvedValue(false)

    const req: any = { body: { email: 'user@example.com', password: INVALID_TEST_PASSWORD } }
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }

    await login(req, res, vi.fn())

    expect(mockCompare).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'E-Mail oder Passwort ungültig.' })
  })

  it('Register with existing email returns 409', async () => {
    mockFindUnique.mockResolvedValue({ id: 'user1', email: 'exists@example.com' })

    const req: any = { body: { email: 'exists@example.com', password: VALID_TEST_PASSWORD } }
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }

    await register(req, res, vi.fn())

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ error: 'E-Mail bereits vergeben.' })
  })
})
