/*
 * ############################################################################### *
 * Created Date: Sa Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Sat Mar 08 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { IUser } from '../interface'

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12)
}

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 90000).toString()
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

  // if (expiry) {
  //   return await redis.set(key, value, 'EX', expiry)
  // }

  // return await redis.set(key, value)
}

const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  })

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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

export {
  toJSON,
  hashPassword,
  generateVerificationCode,
  setCache,
  generateTokenAndSetCookie,
}
