/*
 * ############################################################################### *
 * Created Date: Sa Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Wed May 14 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */

// import { ENVIRONMENT } from '@/common/config'

export enum Role {
  User = 'user',
  Admin = 'superuser',
  Instructor = 'instructor',
}

export enum Provider {
  Local = 'local',
  Google = 'google',
}

export enum Gender {
  Male = 'male',
  Female = 'female',
}

export enum JWTExpiresIn {
  Access = 15 * 60 * 1000,
  Refresh = 24 * 60 * 60 * 1000,
}

// export const TOTPBaseConfig = {
//   issuer: `${ENVIRONMENT.APP.NAME}`,
//   label: `${ENVIRONMENT.APP.NAME}`,
//   algorithm: 'SHA1',
//   digits: 6,
// }

export enum VerifyTimeBased2faTypeEnum {
  CODE = 'CODE',
  EMAIL_CODE = 'EMAIL_CODE',
  DISABLE_2FA = 'DISABLE_2FA',
}

export enum twoFactorTypeEnum {
  APP = 'APP',
  EMAIL = 'EMAIL',
}

export enum Country {
  MALI = 'MALI',
  BENIN = 'BENIN',
  GHANA = 'GHANA',
  GAMBIA = 'GAMBIA',
  LIBERIA = 'LIBERIA',
  NIGERIA = 'NIGERIA',
  CAMEROON = 'CAMEROON',
}

export enum Category {
  Marketing_and_Sales = 'Marketing and Sales',
  Personal_Development = 'Personal Development',
  Technology_and_coding = 'Technology and Coding',
  Education_and_Teaching = 'Education and Teaching',
  Finance_and_Accounting = 'Finance and Accounting',
  Creative_arts_and_design = 'Creative Arts and Design',
  Data_Science_and_Analytics = 'Data_Science_and_Analytics',
  Business_and_Entrepreneurship = 'Business and Entrepreneurship',
  Soft_Skills_and_Personal_Development = 'Soft Skills and Personal Development',
}

export enum SubCategories {}

export enum StatusEnum {
  DRAFT = 'Draft',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  IN_REVIEW = 'In Review',
}

export enum FlaggedReasonTypeEnum {
  EXISTS = 'Exists',
  MISMATCH = 'Mismatch',
  INAPPROPRIATE_CONTENT = 'In-appropriate Content',
}

export enum PaymentStatusEnum {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  FAILED = 'Failed',
  REFUNDED = 'Refunded',
  REFUND_FAILED = 'Refund failed',
}

export enum LocationTypeEnum {
  SIGNIN = 'SIGNIN',
  DONATION = 'DONATION',
}
