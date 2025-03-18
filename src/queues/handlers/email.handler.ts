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

const resend = new Resend(process.env.RESEND_API_KEY!)

const TEMPLATES = {
  welcomeEmail: {
    subject: 'Welcome to ETutor',
    template: welcomeEmail,
    from: 'ETutor <onboarding@resend.dev>',
  },
}

export const sendEmail = async (job: EmailJobData) => {
  const { type, data } = job as EmailJobData

  const options = TEMPLATES[type]

  if (!options) {
    logger.error('Email template not found')
    return
  }

  console.log('job send email', job)
  console.log('options', options)
  console.log(options.template(data))

  try {
    const dispatch = await resend.emails.send({
      from: options.from,
      to: data.to,
      subject: options.subject,
      html: options.template(data),
    })
    console.log('dispatch', dispatch)
    logger.info(`Resend api successfully delivered ${type} email to ${data.to}`)
  } catch (error) {
    console.error('error', error)
    logger.error(
      `Resend api failed to deliver ${type} email to ${data.to}` + error
    )
  }
}
