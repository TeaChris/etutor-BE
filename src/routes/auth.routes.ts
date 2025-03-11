/*
 * ############################################################################### *
 * Created Date: Sa Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Tue Mar 11 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */

import { createAccount, session } from '../controllers'
import { Router } from 'express'

const router = Router()

router.post('/create-account', createAccount)

import { protect } from '@/middlewares'
router.get('/session', session)

export { router as authRouter }
