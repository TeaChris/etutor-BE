/*
 * ############################################################################### *
 * Created Date: Sa Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Sat Mar 08 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */

import * as winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => {
      const logEntry = `${timestamp} ${level}: ${message}`
      return logEntry.replace(/\u001b\[0m/g, '')
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/info.log', level: 'info' }),
  ],
})

export const stream = {
  write: (message: string) => {
    logger.info(message.trim())
  },
}
