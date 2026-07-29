import rateLimit from 'express-rate-limit'

const TOO_MANY_REQUESTS = { error: 'Zu viele Anfragen. Bitte später erneut versuchen.' }

const createRateLimiter = (windowMs, max) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: TOO_MANY_REQUESTS,
})

export const loginRateLimiter = createRateLimiter(15 * 60 * 1000, 10)
export const registerRateLimiter = createRateLimiter(60 * 60 * 1000, 5)
export const authRateLimiter = createRateLimiter(15 * 60 * 1000, 60)