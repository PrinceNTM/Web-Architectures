import { sendHabitCreatedEmail } from './sendHabitCreatedEmail.js'

const emailQueue = []
let isProcessing = false
let workerInterval = null

export const enqueueEmail = (job) => {
  emailQueue.push(job)
  console.log(`Queued email job: ${job.type}`)
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
        console.warn(`Unknown email job type: ${job.type}`)
    }
  } catch (error) {
    console.error('Error processing email job:', error)
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

  console.log('Email queue worker started')
  return workerInterval
}
