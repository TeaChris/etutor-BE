/*
 * ############################################################################### *
 * Created Date: Fr Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Wed Mar 12 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { ENVIRONMENT } from '../common'

const mongoose = require('mongoose')

export const db = async () => {
  try {
    await mongoose.connect(ENVIRONMENT.DB)
    console.log('Database connected')
  } catch (error) {
    console.log(error)
  }
}
