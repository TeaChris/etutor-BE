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

import { locationModel } from './location'

export interface CommonDataFields {
  to: string
  priority?: string
  name: string
}

export interface WelcomeEmailData extends CommonDataFields {
  verificationLink: string
  email: string
}

export interface ForgotPasswordData extends CommonDataFields {
  token: string
}

export interface ResetPasswordData extends CommonDataFields {
  // add fields here
}

export interface DeleteAccountData extends CommonDataFields {
  days: string
  restoreLink: string
}

export interface RestoreAccountData extends CommonDataFields {
  loginLink: string
}

export interface FallbackOTPEmailData extends CommonDataFields {
  token: string
}

export interface Get2faCodeViaEmailData extends CommonDataFields {
  twoFactorCode: string
  expiryTime: string
}

export interface RecoveryKeysEmailData extends CommonDataFields {
  recoveryCod: string
}

export interface loginNotificationData
  extends Partial<locationModel>,
    CommonDataFields {}

export type EmailJobData =
  | { type: 'welcomeEmail'; data: WelcomeEmailData }
  | { type: 'resetPassword'; data: ResetPasswordData }
  | { type: 'forgotPassword'; data: ForgotPasswordData }
  | { type: 'deleteAccount'; data: DeleteAccountData }
  | { type: 'restoreAccount'; data: RestoreAccountData }
  | { type: 'fallbackOTP'; data: FallbackOTPEmailData }
  | { type: 'get2faCodeViaEmail'; data: Get2faCodeViaEmailData }
  | { type: 'recoveryKeysEmail'; data: RecoveryKeysEmailData }
  | { type: 'loginNotification'; data: loginNotificationData }
