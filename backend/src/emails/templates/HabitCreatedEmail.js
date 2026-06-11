import React from 'react'
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr,
  Button,
} from '@react-email/components'

const HabitCreatedEmail = ({ habitName, createdAt, appUrl, habitId }) => {
  const formattedDate = new Date(createdAt).toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const habitUrl = habitId ? `${appUrl}/habit/${habitId}` : appUrl

  return React.createElement(
    Html,
    null,
    React.createElement(Head, null),
    React.createElement(Preview, null, `Neues Habit erstellt: ${habitName}`),
    React.createElement(
      Body,
      {
        style: {
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f8fafc',
          padding: '24px',
        },
      },
      React.createElement(
        Container,
        {
          style: {
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '32px',
            maxWidth: '560px',
            border: '1px solid #e2e8f0',
          },
        },
        React.createElement(
          Section,
          { style: { marginBottom: '24px' } },
          React.createElement(
            Heading,
            { style: { fontSize: '24px', margin: '0 0 8px', color: '#0f172a' } },
            'Neues Habit erstellt'
          ),
          React.createElement(
            Text,
            { style: { fontSize: '15px', lineHeight: '24px', color: '#475569', margin: '0' } },
            'Du erhältst diese Mail, weil ein neues Habit in deiner Habit-Tracker-App angelegt wurde.'
          )
        ),
        React.createElement(
          Section,
          {
            style: {
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px',
            },
          },
          React.createElement(
            Text,
            { style: { fontSize: '14px', color: '#64748b', margin: '0 0 6px' } },
            'Habit-Name'
          ),
          React.createElement(
            Heading,
            { style: { fontSize: '22px', margin: '0 0 8px', color: '#0f172a' } },
            habitName
          ),
          React.createElement(
            Text,
            { style: { fontSize: '14px', color: '#64748b', margin: '0' } },
            `Erstellt am: ${formattedDate}`
          )
        ),
        React.createElement(
          Section,
          { style: { marginBottom: '8px' } },
          React.createElement(
            Button,
            {
              href: habitUrl,
              style: {
                backgroundColor: '#2563eb',
                borderRadius: '6px',
                color: '#ffffff',
                padding: '12px 20px',
                textDecoration: 'none',
                display: 'inline-block',
              },
            },
            'View in App'
          )
        ),
        React.createElement(Hr, { style: { borderColor: '#e2e8f0', margin: '24px 0 16px' } }),
        React.createElement(
          Text,
          { style: { fontSize: '12px', lineHeight: '18px', color: '#94a3b8', margin: '0' } },
          'Falls du möchtest, kannst du diesen Habit direkt in der App öffnen und sofort weiterarbeiten.'
        )
      )
    )
  )
}

export default HabitCreatedEmail
