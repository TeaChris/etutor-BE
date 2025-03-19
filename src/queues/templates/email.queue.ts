/*
 * ############################################################################### *
 * Created Date: Tu Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Wed Mar 19 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */
import IORedis from 'ioredis'
import { Job, Queue, QueueEvents, Worker, WorkerOptions } from 'bullmq'

import { EmailJobData, logger } from '../../common'
import { sendEmail } from '../handlers'

const connection = new IORedis(process.env.QUEUE_REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  // For Upstash/Redis Cloud (SSL required)
  tls: {
    rejectUnauthorized: false,
  },
})

if (connection) {
  console.log('Connected to queue redis cluster')
  // logger.info('Connected to queue redis cluster')
}

let emailQueue: Queue<EmailJobData>

export const getEmailQueue = () => {
  if (!emailQueue) {
    emailQueue = new Queue<EmailJobData>('emailQueue', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    })
  }
  return emailQueue
}

// src/queues/templates/email.queue.ts

const addEmailToQueue = async (opts: EmailJobData) => {
  try {
    const queue = getEmailQueue()
    // Capture the job instance from add()
    const job = await queue.add(opts.type, opts, {
      ...(opts.data.priority !== 'high' && { priority: 2 }),
    })

    console.log(`Added email job ID: ${job.id}`)
    logger.info(`Added email job ID: ${job.id}`)
  } catch (error) {
    console.error('Error enqueueing email job:', error)
    logger.error('Error enqueueing email job:', error)
    throw error
  }
}

// define worker options
interface EmailWorkerOptions extends WorkerOptions {}

const workerOptions: EmailWorkerOptions = {
  connection,
  limiter: { max: 1, duration: 1000 }, // process 1 email every second due to rate limiting of email sender
  lockDuration: 5000, // 5 seconds to process the job before it can be picked up by another worker
  removeOnComplete: {
    age: 3600, // keep up to 1 hour
    count: 1000, // keep up to 1000 jobs
  },
  removeOnFail: {
    age: 24 * 3600, // keep up to 24 hours
  },
  // concurrency: 5, // process 5 jobs concurrently
}

// create a worker to process jobs from the email queue
// const emailWorker = new Worker<EmailJobData>(
//   'emailQueue',
//   async (job: Job) => await sendEmail(job.data),
//   workerOptions
// )

// EVENT LISTENERS
// create a queue event listener
const emailQueueEvent = new QueueEvents('emailQueue', { connection })

emailQueueEvent.on('failed', ({ jobId, failedReason }) => {
  console.log(`Job ${jobId} failed with error ${failedReason}`)
  logger.error(`Job ${jobId} failed with error ${failedReason}`)
  // Do something with the return value of failed job
})

emailQueueEvent.on('waiting', ({ jobId }) => {
  console.log(`A job with ID ${jobId} is waiting`)
})

emailQueueEvent.on('completed', ({ jobId, returnvalue }) => {
  console.log(`Job ${jobId} completed`, returnvalue)
  logger.info(`Job ${jobId} completed`, returnvalue)
  // Called every time a job is completed in any worker
})

// emailWorker.on('error', (err) => {
//   // log the error
//   console.error(err)
//   logger.error(`Error processing email job: ${err}`)
// })

// src/queues/templates/email.queue.ts
let emailWorker: Worker<EmailJobData>

const startEmailQueue = async () => {
  try {
    const queue = getEmailQueue()
    await queue.waitUntilReady()

    emailWorker = new Worker<EmailJobData>(
      'emailQueue',
      async (job: Job) => {
        console.log(`Processing job ${job.id}`)
        await sendEmail(job.data)
      },
      {
        connection,
        limiter: { max: 1, duration: 1000 },
        lockDuration: 5000,
        removeOnComplete: { age: 3600, count: 1000 },
        removeOnFail: { age: 24 * 3600 },
      }
    )

    emailWorker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`)
    })

    emailWorker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err)
    })

    console.log('Email queue and worker started')
  } catch (error) {
    console.error('Failed to start email queue:', error)
    process.exit(1)
  }
}

const stopEmailQueue = async () => {
  await emailWorker.close()
  await emailQueue.close()
  console.info('Email queue closed!')
}

export {
  addEmailToQueue,
  emailQueue,
  emailQueueEvent,
  emailWorker,
  startEmailQueue,
  stopEmailQueue,
}
