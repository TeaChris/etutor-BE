/*
 * ############################################################################### *
 * Created Date: Sa Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Tue Mar 25 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { NextFunction, Request, Response } from 'express'
import { AppError } from '../common'

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err)

  if (!(err instanceof AppError)) {
    err = new AppError(
      err.message || 'Internal Server Error',
      err.statusCode || 500
    )
  }

  const { statusCode, status, message, data, stack } = err

  const errorResponse: any = {
    status,
    message,
    ...(data && { data }),
  }

  // Include stack trace in development environment
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = stack
  }

  res.status(statusCode).json(errorResponse)
}
