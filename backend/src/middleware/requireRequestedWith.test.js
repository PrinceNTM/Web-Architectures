import { describe, it, expect, vi } from 'vitest'
import {
  blockReactRouterActionEndpoints,
  ensureCsrfCookie,
  requireRequestedWith,
} from './requireRequestedWith.js'

const createRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  cookie: vi.fn(),
})

describe('requireRequestedWith middleware', () => {
  it('allows non state-changing methods', () => {
    const req = { method: 'GET', cookies: {}, get: vi.fn() }
    const res = createRes()
    const next = vi.fn()

    requireRequestedWith(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('allows state-changing request with X-Requested-With header', () => {
    const req = {
      method: 'POST',
      cookies: {},
      get: vi.fn((headerName) => (headerName === 'X-Requested-With' ? 'XMLHttpRequest' : undefined)),
    }
    const res = createRes()
    const next = vi.fn()

    requireRequestedWith(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('allows state-changing request with valid csrf cookie/header pair', () => {
    const token = 'csrf-token-value'
    const req = {
      method: 'PUT',
      cookies: { 'csrf-token': token },
      get: vi.fn((headerName) => (headerName === 'x-csrf-token' ? token : undefined)),
    }
    const res = createRes()
    const next = vi.fn()

    requireRequestedWith(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('blocks state-changing request without ajax header and csrf token', () => {
    const req = {
      method: 'DELETE',
      cookies: {},
      get: vi.fn(() => undefined),
    }
    const res = createRes()
    const next = vi.fn()

    requireRequestedWith(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })
})

describe('ensureCsrfCookie middleware', () => {
  it('sets csrf cookie when missing', () => {
    const req = { cookies: {} }
    const res = createRes()
    const next = vi.fn()

    ensureCsrfCookie(req, res, next)

    expect(res.cookie).toHaveBeenCalledWith(
      'csrf-token',
      expect.any(String),
      expect.objectContaining({
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
      }),
    )
    expect(next).toHaveBeenCalled()
  })

  it('keeps existing csrf cookie unchanged', () => {
    const req = { cookies: { 'csrf-token': 'existing-token' } }
    const res = createRes()
    const next = vi.fn()

    ensureCsrfCookie(req, res, next)

    expect(res.cookie).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})

describe('blockReactRouterActionEndpoints middleware', () => {
  it('blocks path containing _rsc', () => {
    const req = { path: '/api/_rsc/action', get: vi.fn(() => undefined) }
    const res = createRes()
    const next = vi.fn()

    blockReactRouterActionEndpoints(req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(next).not.toHaveBeenCalled()
  })

  it('allows normal endpoint', () => {
    const req = { path: '/api/auth/login', get: vi.fn(() => undefined) }
    const res = createRes()
    const next = vi.fn()

    blockReactRouterActionEndpoints(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })
})
