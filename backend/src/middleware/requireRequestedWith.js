import crypto from 'node:crypto'

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

// CSRF_SECRET must be set via env; fall back to a random per-process secret only in dev.
const getCsrfSecret = () => {
  const secret = process.env.CSRF_SECRET
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CSRF_SECRET env variable is required in production (min 32 chars)')
    }
    // dev-only fallback: stable within process lifetime
    if (!getCsrfSecret._devFallback) {
      getCsrfSecret._devFallback = crypto.randomBytes(32).toString('hex')
    }
    return getCsrfSecret._devFallback
  }
  return secret
}

/** Create a signed CSRF token: nonce.HMAC(nonce) */
const createCsrfToken = () => {
  const nonce = crypto.randomBytes(16).toString('hex')
  const hmac = crypto.createHmac('sha256', getCsrfSecret()).update(nonce).digest('hex')
  return `${nonce}.${hmac}`
}

/** Verify a signed CSRF token with timing-safe comparison. */
const verifyCsrfToken = (token) => {
  if (typeof token !== 'string') return false
  const dot = token.indexOf('.')
  if (dot < 1) return false
  const nonce = token.slice(0, dot)
  const provided = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', getCsrfSecret()).update(nonce).digest('hex')
  const expectedBuf = Buffer.from(expected, 'hex')
  try {
    const providedBuf = Buffer.from(provided, 'hex')
    if (expectedBuf.length !== providedBuf.length) return false
    return crypto.timingSafeEqual(expectedBuf, providedBuf)
  } catch {
    return false
  }
}

const hasValidCsrfTokenPair = (req) => {
  const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME]
  const csrfHeader = req.get(CSRF_HEADER_NAME)
  if (!csrfCookie || !csrfHeader) return false
  // Both the cookie and the header must carry the same signed token.
  if (csrfCookie !== csrfHeader) return false
  return verifyCsrfToken(csrfCookie)
}

export const ensureCsrfCookie = (req, res, next) => {
  const existingToken = req.cookies?.[CSRF_COOKIE_NAME]

  if (!existingToken || !verifyCsrfToken(existingToken)) {
    res.cookie(CSRF_COOKIE_NAME, createCsrfToken(), {
      httpOnly: false, // must be readable by JS to send as header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    })
  }

  next()
}

// Upstream mitigation for current React Router CSRF advisory (GHSA-qwww-vcr4-c8h2):
// X-Requested-With alone is insufficient — require a cryptographically signed CSRF pair.
export const requireRequestedWith = (req, res, next) => {
  if (!STATE_CHANGING_METHODS.has(req.method)) {
    return next()
  }

  if (hasValidCsrfTokenPair(req)) {
    return next()
  }

  return res.status(403).json({ error: 'Ungueltige Anfrage.' })
}

/** Exported for use in tests only – not part of the public API. */
export { createCsrfToken }

// Hard block for unused React Router RSC/Action endpoints as mitigation while upstream fix is unavailable.
export const blockReactRouterActionEndpoints = (req, res, next) => {
  const path = req.path.toLowerCase()
  const looksLikeRscRequest =
    path.includes('/_rsc') ||
    path.includes('/__manifest') ||
    req.get('RSC') === '1' ||
    (req.get('Accept') || '').includes('text/x-component')

  if (looksLikeRscRequest) {
    return res.status(404).json({ error: 'Endpoint nicht verfuegbar.' })
  }

  next()
}