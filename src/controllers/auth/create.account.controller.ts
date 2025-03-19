/*
 * ############################################################################### *
 * Created Date: Sa Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Wed Mar 19 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */

import { Request, Response } from 'express'

import { catchAsync } from '../../middlewares'
import { UserModel } from '../../models'
import {
  toJSON,
  Provider,
  AppError,
  AppResponse,
  hashPassword,
  setCache,
  sendVerificationEmail,
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

  const existingEmail = await UserModel.findOne({ email })
  if (existingEmail) {
    throw new AppError('User with this email already exists', 409)
  }

  const existingUsername = await UserModel.findOne({ username })
  if (existingUsername) {
    throw new AppError('User with this username already exists', 409)
  }

  const hashedPassword = await hashPassword(password)

  const user = await UserModel.create({
    email,
    firstName,
    lastName,
    username,
    password: hashedPassword,
    provider: Provider.Local,
    isTermAndConditionAccepted,
  })

  if (Object.keys(req.body).length === 0) {
    throw new AppError('Request body is empty', 400)
  }

  AppResponse(res, 201, toJSON(user), 'Account created successfully')

  await sendVerificationEmail(user, req)
  await setCache(user._id.toString(), toJSON(user, ['password']))
})
