import React from 'react'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import HabitCreatedEmail from './templates/HabitCreatedEmail.js'

let resendClient = null

export const sendHabitCreatedEmail = async ({ to, habitName, createdAt, appUrl, habitId }) => {
  if (!to) {
    console.warn('No recipient provided for habit-created email.')
    return
  }

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured. Skipping habit-created email.')
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
      console.error('Error sending habit created email:', error)
      return
    }

    console.log('Habit created email sent:', data?.id)
  } catch (error) {
    console.error('Error sending habit created email:', error)
  }
}
