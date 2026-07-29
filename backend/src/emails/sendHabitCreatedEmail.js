import React from 'react'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import HabitCreatedEmail from './templates/HabitCreatedEmail.js'
import { logger } from '../utils/logger.js'

let resendClient = null

export const sendHabitCreatedEmail = async ({ to, habitName, createdAt, appUrl, habitId }) => {
  if (!to) {
    logger.warn('email.habit_created.missing_recipient')
    return
  }

  if (to.endsWith('@example.com')) {
    logger.info('email.habit_created.skipped_test_address')
    return
  }

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    logger.warn('email.habit_created.api_key_missing')
    return
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }

  try {
    const html = await render(
      React.createElement(HabitCreatedEmail, {
        habitName,
        createdAt,
        appUrl,
        habitId,
      })
    )

    const { data, error } = await resendClient.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject: `Neues Habit erstellt: ${habitName}`,
      html,
    })

    if (error) {
      logger.error('email.habit_created.send_failed', error)
      return
    }

    logger.info('email.habit_created.sent')
  } catch (error) {
    logger.error('email.habit_created.render_failed', error)
  }
}
