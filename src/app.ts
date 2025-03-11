/*
 * ############################################################################### *
 * Created Date: Fr Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Mon Mar 10 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */
import { Response, Request } from 'express'
import * as dotenv from 'dotenv'
import { db } from './db/db'

import { authRouter } from './routes'
import { validateDataWithZod, errorHandler } from './middlewares'
import { logger } from './common'

import cors from 'cors'

const express = require('express')

dotenv.config()
const app = express()
const port = process.env.PORT || 5000

/**
 * Express configuration
 */
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']) // Enable trust proxy
// app.use(cookieParser())
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
app.use('/api/v1/alive', (req:Request, res:Response) =>
  res
    .status(200)
    .json({ status: 'success', message: 'Server is up and running' })
)

app.use('/api/v1/auth', authRouter)

app.all('/*', async (req:Request, res:Response) => {
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

app.listen(port, () => {
  db()
  console.log(`App is running on port ${port}`)
})
