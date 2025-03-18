/*
 * ############################################################################### *
 * Created Date: Tu Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Tue Mar 18 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */
import IORedis from 'ioredis'
import { Queue } from 'bullmq'

import { EmailJobData, ENVIRONMENT, logger } from '../../common'

const connection = new IORedis({
  port: ENVIRONMENT.REDIS.PORT,
  host: ENVIRONMENT.REDIS.URL,
  password: ENVIRONMENT.REDIS.PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  offlineQueue: false,
})

if (connection) {
  console.log('Connected to queue redis cluster')
  logger.info('Connected to queue redis cluster')
}

const emailQueue = new Queue<EmailJobData>('emailQueue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
})

const addEmailToQueue = async (opts: EmailJobData) => {
  const { type, data } = opts

  try {
    await emailQueue.add(type, opts, {
      ...(data.priority !== 'high' && { priority: 2 }),
    })
  } catch (error) {
    console.error('Error enqueueing email job', error)
    logger.error('Error enqueueing email job', error)
    throw error
  }
}

export { addEmailToQueue, emailQueue }
