/*
 * ############################################################################### *
 * Created Date: Fr Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Sat Mar 08 2025                                              *
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

const express = require('express')

dotenv.config()
const app = express()
const port = process.env.PORT || 5000

app.use(express.json()) // allows us to parse incoming requests::req.body

app.get('/alive', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is alive and listening to requests' })
})

app.use('/api/v1/auth', authRouter)

app.listen(port, () => {
  db()
  console.log(`App is running on port ${port}`)
})
