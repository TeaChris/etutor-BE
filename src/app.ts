/*
 * ############################################################################### *
 * Created Date: Fr Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Fri Mar 07 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */
import { Response, Request } from 'express'

const express = require('express')

const app = express()

app.get('/', (req: Response, res: Request) => {
  console.log('server is alive')
})

const port = 3500

app.listen(port, () => {
  console.log('App is running on port 3000')
})
