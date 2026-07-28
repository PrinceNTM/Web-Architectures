describe('Critical path - Login and create habit', () => {
  const api = Cypress.env('apiUrl') || 'http://localhost:3000/api'
  const email = 'e2e+test@example.com'
  const password = 'password123'
  const habitName = 'Cypress Habit'

  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: `${api}/auth/register`,
      body: { email, password },
      failOnStatusCode: false,
    })
  })

  it('logs in, gets redirected, creates a habit and sees it in the list', () => {
    cy.visit('/login')

    cy.get('[data-cy=login-email]').clear().type(email)
    cy.get('[data-cy=login-password]').clear().type(password)
    cy.get('[data-cy=terms-consent]').check({ force: true })
    cy.get('[data-cy=login-submit]').click()

    // After login, should be redirected to home
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard')

    // Create a new habit
    cy.get('[data-cy=new-habit-input]').clear().type(habitName)
    cy.get('[data-cy=add-habit-btn]').click()

    // The habit should appear in the list
    cy.get('[data-cy=habit-name]').contains(habitName)
  })
})
