import { sendHabitCreatedEmail } from './sendHabitCreatedEmail.js'
import { logger } from '../utils/logger.js'

const emailQueue = []
let isProcessing = false
let workerInterval = null

// Per-address sliding-window counters: address → { count, windowStart }
const emailCounters = new Map()
const EMAIL_MAX_PER_HOUR = Number(process.env.EMAIL_MAX_PER_HOUR) || 10
const EMAIL_WINDOW_MS = 60 * 60 * 1000

const checkEmailRateLimit = (to) => {
  const now = Date.now()
  const entry = emailCounters.get(to)
  if (!entry || now - entry.windowStart > EMAIL_WINDOW_MS) {
    emailCounters.set(to, { count: 1, windowStart: now })
    return false // not limited
  }
  entry.count += 1
  if (entry.count > EMAIL_MAX_PER_HOUR) {
    if (entry.count === EMAIL_MAX_PER_HOUR + 1) {
      // log once when limit is first breached — mask most of address
      const masked = to.replace(/^(.{2}).*(@.*)$/, '$1***$2')
      logger.warn('email.rate_limit.exceeded', { to: masked, count: entry.count })
    }
    return true // limited
  }
  return false
}

export const enqueueEmail = (job) => {
  emailQueue.push(job)
  logger.info('email.job.queued', { type: job.type })
}

const processNextJob = async () => {
  if (isProcessing || emailQueue.length === 0) {
    return
  }

  isProcessing = true
  const job = emailQueue.shift()

  try {
    if (job.to && checkEmailRateLimit(job.to)) {
      logger.warn('email.job.rate_limited', { type: job.type })
      return
    }

    switch (job.type) {
      case 'habit_created':
        await sendHabitCreatedEmail({
          to: job.to,
          habitName: job.habitName,
          createdAt: job.createdAt,
          appUrl: job.appUrl,
          habitId: job.habitId,
        })
        break
      default:
        logger.warn('email.job.unknown', { type: job.type })
    }
  } catch (error) {
    logger.error('email.job.failed', error, { type: job.type })
  } finally {
    isProcessing = false
  }
}

export const startEmailQueueWorker = () => {
  if (workerInterval) {
    return workerInterval
  }

  workerInterval = setInterval(() => {
    void processNextJob()
  }, 1000)

  logger.info('email.worker.started')
  return workerInterval
}
