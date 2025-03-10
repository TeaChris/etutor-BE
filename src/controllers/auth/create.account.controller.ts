/*
 * ############################################################################### *
 * Created Date: Sa Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Mon Mar 10 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */

import { catchAsync } from '../../middlewares'
import { Request, Response } from 'express'
import { UserModel } from '../../models'
import {
  toJSON,
  Provider,
  AppError,
  AppResponse,
  hashPassword,
  generateTokenAndSetCookie,
  generateVerificationCode,
} from '../../common'

export const createAccount = catchAsync(async (req: Request, res: Response) => {
  const {
    email,
    firstName,
    lastName,
    password,
    isTermAndConditionAccepted,
    username,
  } = req.body

  if (!email || !firstName || !lastName || !password || !username) {
    throw new AppError('Incomplete create account data', 400)
  }

  const existingUser = await UserModel.findOne({
    $or: [{ email }, { username }],
  })

  if (existingUser) {
    let errorMessage = 'User already exists'

    if (existingUser.email === email && existingUser.username === username) {
      errorMessage = 'User with this email and username already exists'
    } else if (existingUser.email === email) {
      errorMessage = 'User with this email already exists'
    } else if (existingUser.username === username) {
      errorMessage = 'User with this username already exists'
    }
    throw new AppError(errorMessage, 409)
  }

  const hashedPassword = await hashPassword(password)
  const verificationToken = generateVerificationCode()

  const user = await UserModel.create({
    email,
    firstName,
    lastName,
    username,
    password: hashedPassword,
    provider: Provider.Local,
    isTermAndConditionAccepted,
    verificationToken,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
  })

  if (Object.keys(req.body).length === 0) {
    throw new AppError('Request body is empty', 400)
  }

  await user.save()

  generateTokenAndSetCookie(res, user._id)

  toJSON(user, ['password'])
  AppResponse(res, 201, toJSON(user), 'Account created successfully')
})
