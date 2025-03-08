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

import { catchAsync } from '../../middlewares'
import { Request, Response } from 'express'
import { UserModel } from '@/models'
import {
  AppError,
  AppResponse,
  generateTokenAndSetCookie,
  generateVerificationCode,
  hashPassword,
  Provider,
  toJSON,
} from '@/common'

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

  if (!isTermAndConditionAccepted) {
    throw new AppError(
      'Kindly accept term and condition to create account',
      400
    )
  }

  const existingUser = await UserModel.find({ email })

  if (existingUser) {
    throw new AppError('User with this email already exist', 409)
  }

  const existingUsername = await UserModel.findOne({ username })

  if (existingUsername) {
    throw new AppError('User with this username already exists', 409)
  }

  const hashedPassword = await hashPassword(password)
  const verificationToken = generateVerificationCode()

  const user = await UserModel.create({
    email,
    firstName,
    lastName,
    password: hashedPassword,
    provider: Provider.Local,
    isTermAndConditionAccepted,
    verificationToken,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
  })

  await user.save()

  generateTokenAndSetCookie(res, user._id)

  toJSON(user, ['password'])
  AppResponse(res, 201, toJSON(user), 'Account created successfully')
})
