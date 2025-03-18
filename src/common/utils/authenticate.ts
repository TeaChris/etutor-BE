/*
 * ############################################################################### *
 * Created Date: Tu Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Tue Mar 18 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { ENVIRONMENT } from '../config'
import { AppError, type IUser } from '../../common'
import { UserModel } from '../../models'
import jwt from 'jsonwebtoken'
import { DateTime } from 'luxon'
import { Require_id } from 'mongoose'

import { decodeData, getFromCache, hashData, setCache } from './helper'

if (!ENVIRONMENT.JWT.ACCESS_KEY) {
  throw new Error('JWT Access Key not found')
}

type AuthenticateResult = {
  currentUser: Require_id<IUser>
  accessToken?: string
}

export const authenticate = async ({
  etutorAccessToken,
  etutorRefreshToken,
}: {
  etutorAccessToken?: string
  etutorRefreshToken?: string
}): Promise<AuthenticateResult> => {
  if (!etutorRefreshToken) {
    throw new AppError('Unauthorized', 401)
  }

  // verify user access
  const handleUserVerification = async (decoded) => {
    // fetch user from redis cache or db
    const cachedUser = await getFromCache<Require_id<IUser>>(decoded.id)

    const user = cachedUser
      ? cachedUser
      : ((await UserModel.findOne({ _id: decoded.id }).select(
          'refreshToken isSuspended isEmailVerified'
        )) as Require_id<IUser>)

    if (!cachedUser && user) {
      await setCache(decoded.id, user)
    }

    // check if refresh token matches the stored refresh token in db
    // in case the user has logged out and the token is still valid
    // or the user has re authenticated and the token is still valid etc

    if (user.refreshToken !== etutorRefreshToken) {
      throw new AppError('Invalid token. Please log in again!', 401)
    }

    if (user.isSuspended) {
      throw new AppError('Your account is currently suspended', 401)
    }

    if (!user.isEmailVerified) {
      throw new AppError(
        'Your email is yet to be verified',
        422,
        `email-unverified:${user.email}`
      )
    }
    // check if user has changed password after the token was issued
    // if so, invalidate the token
    if (
      user.passwordChangedAt &&
      DateTime.fromISO(user.passwordChangedAt.toISOString()).toMillis() >
        DateTime.fromMillis(decoded.iat).toMillis()
    ) {
      throw new AppError(
        'Password changed since last login. Please log in again!',
        401
      )
    }

    // csrf protection
    // browser client fingerprinting

    return user
  }

  const handleTokenRefresh = async () => {
    try {
      const decodeRefreshToken = await decodeData(
        etutorRefreshToken,
        ENVIRONMENT.JWT.REFRESH_KEY!
      )

      const currentUser = await handleUserVerification(decodeRefreshToken)

      // generate access tokens
      const accessToken = await hashData(
        { id: currentUser._id.toString() },
        { expiresIn: ENVIRONMENT.JWT_EXPIRES_IN.ACCESS }
      )

      return {
        accessToken,
        currentUser,
      }
    } catch (error) {
      console.log(error)
      throw new AppError('Session expired, please log in again', 401)
    }
  }

  try {
    if (!etutorAccessToken) {
      // if access token is not present, verify the refresh token and generate a new access token
      return await handleTokenRefresh()
    } else {
      const decodeAccessToken = await decodeData(
        etutorAccessToken,
        ENVIRONMENT.JWT.ACCESS_KEY!
      )
      const currentUser = await handleUserVerification(decodeAccessToken)

      // attach the user to the request object
      return { currentUser }
    }
  } catch (error) {
    if (
      (error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError) &&
      etutorRefreshToken
    ) {
      // verify the refresh token and generate a new access token
      return await handleTokenRefresh()
    } else {
      throw new AppError('An error occurred, please log in again', 401)
    }
  }
}
