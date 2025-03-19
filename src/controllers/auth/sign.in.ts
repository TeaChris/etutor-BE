import type { Request, Response } from 'express'
import { DateTime } from 'luxon'

import {
  ENVIRONMENT,
  Provider,
  ILocation,
  IUser,
  AppResponse,
  AppError,
  extractUAData,
  sendVerificationEmail,
  setCookie,
  setCache,
  toJSON,
  hashData,
  logger,
} from '../../common'

import { catchAsync } from '../../middlewares'
import { UserModel, locationModel } from '../../models'
import { addEmailToQueue } from '../../queues'

export const signIn = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body
  logger.info(`Sign-in attempt initiated for email: ${email}`, {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  })

  if (!email || !password) {
    logger.warn('Missing credentials in sign-in attempt', { email })
    throw new AppError('Email and password are required fields')
  }

  logger.debug('Searching for user in database', { email })
  const user = await UserModel.findOne({
    email,
    provider: Provider.Local,
  }).select(
    '+refreshToken +loginRetries +isSuspended +isEmailVerified +lastLogin +password +twoFA.type +twoFA.active'
  )

  if (!user) {
    logger.warn('User not found during sign-in attempt', { email })
    throw new AppError('Email or password is incorrect', 401)
  }

  logger.info(`User found: ${user._id}`, {
    userId: user._id,
    isEmailVerified: user.isEmailVerified,
    isSuspended: user.isSuspended,
  })

  // Check login retries logic
  const currentRequestTime = DateTime.now()
  const lastLoginRetry = currentRequestTime.diff(
    DateTime.fromISO(user.lastLogin.toISOString()),
    'hours'
  )

  if (user.loginRetries >= 3 && Math.round(lastLoginRetry.hours) < 12) {
    logger.warn('Login retries exceeded', {
      userId: user._id,
      loginRetries: user.loginRetries,
      lastLogin: user.lastLogin,
    })
    throw new AppError('Login retries exceeded!', 401)
  }

  logger.debug('Verifying password for user', { userId: user._id })
  const isPasswordValid = await user.verifyPassword(password)
  if (!isPasswordValid) {
    logger.warn('Invalid password attempt', { userId: user._id })
    await UserModel.findByIdAndUpdate(user._id, {
      $inc: { loginRetries: 1 },
    })
    throw new AppError('Email or password is incorrect', 401)
  }

  logger.debug('Password validated successfully', { userId: user._id })

  if (!user.isEmailVerified) {
    logger.info('Resending verification email', { userId: user._id })
    await sendVerificationEmail(user, req)
    throw new AppError(
      'Your email is yet to be verified',
      422,
      `email-unverified:${user.email}`
    )
  }

  // Token generation logging
  logger.info('Generating access token', { userId: user._id })
  const accessToken = await hashData(
    { id: user._id.toString() },
    { expiresIn: ENVIRONMENT.JWT_EXPIRES_IN.ACCESS }
  )

  logger.info('Generating refresh token', { userId: user._id })
  const refreshToken = await hashData(
    { id: user._id.toString() },
    { expiresIn: ENVIRONMENT.JWT_EXPIRES_IN.REFRESH },
    ENVIRONMENT.JWT.REFRESH_KEY
  )

  logger.debug('Updating user login information', { userId: user._id })
  const updatedUser = (await UserModel.findByIdAndUpdate(
    user._id,
    {
      loginRetries: 0,
      lastLogin: DateTime.now(),
      refreshToken,
      ...(user.twoFA.active && { 'twoFA.isVerified': false }),
    },
    { new: true }
  )) as IUser

  // Location logging
  const userAgent = await extractUAData(req)
  logger.info('User login location data', {
    userId: user._id,
    locationData: userAgent,
  })

  try {
    await locationModel.create({
      ...userAgent,
      user: user._id,
    })
    logger.debug('Location record created successfully', { userId: user._id })
  } catch (error) {
    logger.error('Failed to create location record', {
      userId: user._id,
      error: (error as Error).message,
    })
  }

  logger.debug('Updating user cache', { userId: user._id })
  await setCache(user._id.toString(), {
    ...toJSON(updatedUser, ['password']),
    refreshToken,
  })

  if (user.twoFA.active) {
    logger.info('2FA required for user', {
      userId: user._id,
      twoFAType: user.twoFA.type,
    })
    return AppResponse(
      res,
      200,
      {
        user: {
          twoFA: {
            type: user.twoFA.type,
            active: user.twoFA.active,
          },
        },
      },
      'Sign in successfully, proceed to 2fa verification'
    )
  }

  logger.info('Successful sign-in without 2FA', { userId: user._id })
  const lastLoginMeta = await locationModel
    .findOne({ user: user._id })
    .sort({ createdAt: -1 })

  if (
    lastLoginMeta?.country !== userAgent.country ||
    lastLoginMeta?.city !== userAgent.city
  ) {
    logger.info('New login location detected, queuing notification', {
      userId: user._id,
      newLocation: userAgent,
    })
    await addEmailToQueue({
      type: 'loginNotification',
      data: {
        to: user.email,
        name: user.firstName,
        ipv4: userAgent.ipv4,
        os: userAgent.os,
        country: userAgent.country,
        city: userAgent.city,
        timezone: userAgent.timezone,
      },
    })
  }

  logger.info('Sign-in process completed successfully', {
    userId: user._id,
    email: user.email,
    signInTime: new Date().toISOString(),
  })

  return AppResponse(
    res,
    200,
    { user: toJSON(updatedUser) },
    'Sign in successful'
  )
})
