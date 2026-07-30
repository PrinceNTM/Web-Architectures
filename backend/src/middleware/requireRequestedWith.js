import crypto from 'node:crypto'

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

const hasValidCsrfTokenPair = (req) => {
  const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME]
  const csrfHeader = req.get(CSRF_HEADER_NAME)

  if (!csrfCookie || !csrfHeader) {
    return false
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(csrfCookie), Buffer.from(csrfHeader))
  } catch {
    return false
  }
}

export const ensureCsrfCookie = (req, res, next) => {
  const existingToken = req.cookies?.[CSRF_COOKIE_NAME]

  if (!existingToken) {
    res.cookie(CSRF_COOKIE_NAME, crypto.randomUUID(), {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    })
  }

  next()
}

// Upstream mitigation for current React Router CSRF advisory:
// state-changing requests are only accepted with X-Requested-With OR a valid CSRF cookie/header pair.
export const requireRequestedWith = (req, res, next) => {
  if (!STATE_CHANGING_METHODS.has(req.method)) {
    return next()
  }

  const hasAjaxHeader = req.get('X-Requested-With') === 'XMLHttpRequest'
  if (hasAjaxHeader || hasValidCsrfTokenPair(req)) {
    return next()
  }

  return res.status(403).json({ error: 'Ungueltige Anfrage.' })
}

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