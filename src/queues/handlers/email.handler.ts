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
import { Resend } from 'resend'

import { ENVIRONMENT, logger } from '../../common'
import type { EmailJobData } from '../../common/interface'
import { welcomeEmail } from '../templates'

const resend = new Resend(ENVIRONMENT.EMAIL.API_KEY)

const TEMPLATES = {
  welcomeEmail: {
    subject: 'Welcome to ETutor',
    template: welcomeEmail,
    from: 'ETutor <donotreply@etutor.com>',
  },
}
