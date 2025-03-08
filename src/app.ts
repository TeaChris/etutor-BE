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

const express = require('express')

dotenv.config()

const app = express()

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Hello World' })
})

const port = process.env.PORT || 5000

app.listen(port, () => {
  db()
  console.log('App is running on port 3000')
})
