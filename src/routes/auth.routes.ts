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

import { protect } from '../middlewares'
import {createAccount, session, verifyEmail} from '../controllers'

import { Router } from 'express'

const router = Router()

router.post('/verify-email', verifyEmail)
router.post('/create-account', createAccount)

router.use(protect) // protected endpoints
router.get('/session', session)

export { router as authRouter }
