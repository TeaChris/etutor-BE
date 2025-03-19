import { Request, Response } from 'express'

import {
  AppError,
  AppResponse,
  decodeData,
  getFromCache,
  removeFromCache,
} from '../../common'
import type { IUser } from '../../common'
import { catchAsync } from '@/middlewares'
import { UserModel } from '../../models'

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body

  if (!token) {
    throw new AppError('Token is required')
  }

  const decryptedToken = await decodeData(token)

  if (!decryptedToken.id) {
    throw new AppError('Verification token is invalid')
  }

  const cachedUser = (await getFromCache(decryptedToken.id)) as IUser

  if (cachedUser && cachedUser.isEmailVerified) {
    return AppResponse(res, 200, {}, 'Account already verified')
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    decryptedToken.id,
    { isEmailVerified: true },
    { new: true }
  )

  if (!updatedUser) {
    throw new AppError('Verification failed', 400)
  }

  await removeFromCache(updatedUser._id.toString())

  AppResponse(res, 200, {}, 'Account already verified')
}
