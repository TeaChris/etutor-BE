/*
 * ############################################################################### *
 * Created Date: Mo Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Wed May 14 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { Request, Response } from 'express'
import { catchAsync } from '../../middlewares'
import { AppError, AppResponse, toJSON } from '../../common'

export const session = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user

  if (!currentUser) {
    throw new AppError('Unauthenticated', 401)
  }

  const initialData = currentUser._id
  return AppResponse(
    res,
    200,
    { ...initialData, user: toJSON(currentUser) },
    'Authenticated'
  )
})
