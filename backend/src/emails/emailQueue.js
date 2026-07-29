import { sendHabitCreatedEmail } from './sendHabitCreatedEmail.js'
import { logger } from '../utils/logger.js'

const emailQueue = []
let isProcessing = false
let workerInterval = null

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
