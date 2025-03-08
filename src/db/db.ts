/*
 * ############################################################################### *
 * Created Date: Fr Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Sat Mar 08 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

const mongoose = require('mongoose')

export const db = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('Database connected')
  } catch (error) {
    console.log(error)
  }
}
