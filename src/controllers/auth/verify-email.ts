import { Request, Response } from 'express'

import {
  AppError,
  AppResponse,
  decodeData,
  getFromCache,
  removeFromCache,
} from '../../common'
import type { IUser } from '../../common'
import { catchAsync } from '../../middlewares'
import { UserModel } from '../../models'

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.body
  console.log('Verification token received:', token) // Log the incoming token

  if (!token) {
    throw new AppError('Token is required', 400)
  }

  try {
    const decryptedToken = await decodeData(token)
    console.log('Decrypted token:', decryptedToken)

    if (!decryptedToken?.id) {
      throw new AppError('Invalid verification token', 400)
    }

    console.log('Looking for user ID:', decryptedToken.id)

    // Check cache first
    const cachedUser = (await getFromCache(decryptedToken.id)) as IUser
    console.log('Cached user:', cachedUser ? 'found' : 'not found')

    if (cachedUser?.isEmailVerified) {
      return AppResponse(res, 200, {}, 'Account already verified!')
    }

    // Database check
    const existingUser = await UserModel.findById(decryptedToken.id)
    console.log('Database user exists:', !!existingUser)

    if (!existingUser) {
      throw new AppError('User not found', 404)
    }

    // Perform update
    const updatedUser = await UserModel.findByIdAndUpdate(
      decryptedToken.id,
      { isEmailVerified: true },
      { new: true, runValidators: true }
    )

    console.log('Update result:', updatedUser)

    if (!updatedUser) {
      throw new AppError('Verification failed!', 400)
    }

    await removeFromCache(updatedUser._id.toString())
    console.log('Cache cleared for user:', updatedUser._id)

    AppResponse(res, 200, {}, 'Account successfully verified!')
  } catch (err) {
    console.error('Verification error:', err)
    throw err
  }
})
