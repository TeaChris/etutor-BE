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

import { Response } from 'express'

export function AppResponse(
  res: Response,
  statusCode: number = 200,
  data: Record<string, string[]> | unknown | string | null,
  message: string
) {
  res.status(statusCode).json({
    status: 'success',
    data: data ?? null,
    message: message ?? 'Success',
  })
}
