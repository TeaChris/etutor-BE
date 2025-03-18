/*
 * ############################################################################### *
 * Created Date: Sa Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Tue Mar 18 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */

import { promisify } from 'util'
import { ENVIRONMENT } from '../config'
import { IHashData, IUser } from '../interface'
import { addEmailToQueue } from '../../queues'

import Redis from 'ioredis'
import bcrypt from 'bcryptjs'
import { Request } from 'express'
import { Require_id } from 'mongoose'
import jwt, { SignOptions } from 'jsonwebtoken'
import type { CookieOptions, Response } from 'express'

if (!ENVIRONMENT.CACHE_REDIS.URL) {
  throw new Error('Cache redis url not found')
}

const redis = new Redis(ENVIRONMENT.CACHE_REDIS.URL!)

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12)
}

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 90000).toString()
}

const dateFromString = async (value: string) => {
  const date = new Date(value)

  if (isNaN(date?.getTime())) {
    return false
  }

  return date
}

const decodeData = async (token: string, secret?: string) => {
  const verifyAsync: (arg1: string, arg2: string) => jwt.JwtPayload = promisify(
    jwt.verify
  )
  console.log(secret)

  const verify = await verifyAsync(
    token,
    secret ? secret : ENVIRONMENT.JWT.ACCESS_KEY!
  )
  return verify
}

const hashData = (data: IHashData, options?: SignOptions, secret?: string) => {
  return jwt.sign(
    { ...data },
    secret ? secret : ENVIRONMENT.JWT.ACCESS_KEY,
    ...[options?.expiresIn ? { expiresIn: options?.expiresIn } : {}]
  )
}

const setCookie = (
  res: Response,
  name: string,
  value: string,
  options: CookieOptions = {}
) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: ENVIRONMENT.APP.ENV === 'production',
    path: '/',
    sameSite: ENVIRONMENT.APP.ENV === 'production' ? 'none' : 'lax',
    partitioned: ENVIRONMENT.APP.ENV === 'production',
    ...options,
  })
}

const getFromCache = async <T = string>(key: string) => {
  if (!key) {
    throw new Error('Invalid key provided')
  }

  const data = await redis.get(key)
  if (!data) {
    return null
  }

  let parseData
  try {
    parseData = JSON.parse(data)
  } catch (error) {
    parseData = data
  }

  return parseData as T
}

const setCache = async (
  key: string,
  value: string | number | object | Buffer,
  expiry?: number
) => {
  if (!key) {
    throw new Error('Invalid key provided')
  }
  if (!value) {
    throw new Error('Invalid value provided')
  }

  if (typeof value === 'object' && !(value instanceof Buffer)) {
    value = JSON.stringify(value)
  }

  if (expiry) {
    return await redis.set(key, value, 'EX', expiry)
  }

  return await redis.set(key, value)
}

const generateTokenAndSetCookie = (res: Response, userId: string) => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables')
  }
  const token = jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  })

  res.cookie('token', token, {
    httpOnly: true,
    secure: ENVIRONMENT.APP.ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  return token
}

const toJSON = (obj: IUser, fields?: string[]): Partial<IUser> => {
  const user = JSON.parse(JSON.stringify(obj))

  if (fields && fields.length === 0) {
    return user
  }

  const results = { ...user }

  if (fields && fields.length > 0) {
    for (const field of fields) {
      if (field in results) {
        delete results[field as keyof IUser]
      }
    }
    return results
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    refreshToken,
    loginRetries,
    lastLogin,
    password,
    updatedAt,
    ...rest
  } = user

  return rest
}

const sendVerificationEmail = async (user: Require_id<IUser>, req: Request) => {
  // add welcome email to queue for user to verify account
  const emailVerificationToken = hashData({ id: user._id.toString() })

  await addEmailToQueue({
    type: 'welcomeEmail',
    data: {
      to: user.email,
      name: user.firstName,
      email: user.email,
      verificationLink: `${getDomainReferer(
        req
      )}/verify-email?token=${emailVerificationToken}`,
    },
  })
}

const getDomainReferer = (req: Request) => {
  try {
    const referer = req.get('x-referer')

    if (!referer) {
      return `${ENVIRONMENT.FRONTEND_URL}`
    }

    return referer
  } catch (error) {
    return null
  }
}

export {
  toJSON,
  hashData,
  setCache,
  setCookie,
  decodeData,
  getFromCache,
  hashPassword,
  dateFromString,
  getDomainReferer,
  sendVerificationEmail,
  generateVerificationCode,
  generateTokenAndSetCookie,
}
