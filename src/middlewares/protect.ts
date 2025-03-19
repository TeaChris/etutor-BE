/*
 * ############################################################################### *
 * Created Date: Tu Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Wed Mar 19 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { AppError, authenticate, setCookie } from '../common'
import { catchAsync } from '../middlewares'

import type { NextFunction, Request, Response } from 'express'

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // get the cookies from the request headers
    const { etutorAccessToken, etutorRefreshToken } = req.cookies

    const { currentUser, accessToken } = await authenticate({
      etutorRefreshToken,
      etutorAccessToken,
    })

    if (accessToken) {
      setCookie(res, 'etutorAccessToken', accessToken, {
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
    }

    // attach the user to the request object
    req.user = currentUser

    const reqPath = req.path

    // check if user has been authenticated but has not verified 2fa
    if (!reqPath.includes('/2fa/') && req.user.twoFA.active) {
      const lastLoginTimeInMilliseconds = new Date(
        currentUser.lastLogin
      ).getTime()
      const lastVerificationTimeInMilliseconds = new Date(
        currentUser.twoFA.verificationTime as Date
      ).getTime()

      if (lastLoginTimeInMilliseconds > lastVerificationTimeInMilliseconds) {
        throw new AppError('2FA verification is required', 403, {
          type: currentUser.twoFA.type,
          email: currentUser.email,
        })
      }
    }

    next()
  }
)
