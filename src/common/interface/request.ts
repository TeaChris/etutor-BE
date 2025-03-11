/*
 * ############################################################################### *
 * Created Date: Tu Mar 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Tue Mar 11 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { Require_id } from 'mongoose'
// import { Server } from 'socket.io'
import type { IUser } from './user'
import type { File as MulterFile } from 'multer'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: Require_id<IUser>
      // io: Server
      file?: MulterFile
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Socket {
    interface Socket {
      user?: Require_id<IUser>
    }
  }
}

declare module 'express-serve-static-core' {
  export interface CookieOptions {
    partitioned?: boolean
  }
}
