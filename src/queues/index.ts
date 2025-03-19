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

import { startEmailQueue, stopEmailQueue } from './templates'

const startAllQueuesAndWorkers = async () => {
  await startEmailQueue()
}

const stopAllQueuesAndWorkers = async () => {
  await stopEmailQueue()
}

export * from './handlers'
export * from './templates'

export { startAllQueuesAndWorkers, stopAllQueuesAndWorkers }
