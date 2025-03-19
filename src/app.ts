/*
 * ############################################################################### *
 * Created Date: Fr Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Wed Mar 19 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' })
// if (process.env.NODE_ENV === 'production') {
//   require('module-alias/register')
// }

import { ENVIRONMENT, logger } from './common'

import { Response, Request } from 'express'
import http from 'http'

import { db } from './db/db'
import { authRouter } from './routes'
import { validateDataWithZod, errorHandler } from './middlewares'
import cookieParser from 'cookie-parser';
// import { ENVIRONMENT, logger } from './common'

import cors from 'cors'
import * as process from 'node:process'
import { startAllQueuesAndWorkers } from './queues'

const express = require('express')

dotenv.config()

/**
 * Default app configuration
 */
const app = express()
const port = ENVIRONMENT.APP.PORT!
const appName = ENVIRONMENT.APP.NAME!

/**
 * Express configuration
 */
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']) // Enable trust proxy
app.use(cookieParser())
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

//Middleware to allow CORS from frontend
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
)

app.use(validateDataWithZod)
app.use('/api/v1/alive', (req: Request, res: Response) =>
  res
    .status(200)
    .json({ status: 'success', message: 'Server is up and running' })
)

app.use('/api/v1/auth', authRouter)

app.all('/*', async (req: Request, res: Response): Promise<void> => {
  logger.error(
    'route not found ' + new Date(Date.now()) + ' ' + req.originalUrl
  )
  res.status(404).json({
    status: 'error',
    message: `OOPs!! No handler defined for ${req.method.toUpperCase()}: ${
      req.url
    } route. Check the API documentation for more details.`,
  })
})

app.use(errorHandler)

const server = http.createServer(app)

// app.listen(port, (): void => {
//   db()
//   console.log(`=> ${ENVIRONMENT.APP.NAME} servers is running on port ${port}`)
//   ;(async () => {
//     await startAllQueuesAndWorkers()
//   })()
// })

const appServer = server.listen(port, async () => {
  await db()
  console.log(`=> ${appName} app listening on port ${port}!`)

  try {
    await startAllQueuesAndWorkers()
    console.log('All queues started successfully')
  } catch (error) {
    console.error('Failed to start queues:', error)
    process.exit(1)
  }
})
