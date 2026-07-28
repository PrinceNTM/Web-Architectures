describe('Login Sad Path - invalid credentials', () => {
  const api = Cypress.env('apiUrl') || 'http://localhost:3000/api'
  const email = 'e2e+test@example.com'
  const password = 'password123'

  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: `${api}/auth/register`,
      body: { email, password },
      failOnStatusCode: false,
    })
  })

  it('shows generic error for existing email + wrong password', () => {
    cy.visit('/login')

    // existing email but wrong password
    cy.get('[data-cy=login-email]').clear().type(email)
    cy.get('[data-cy=login-password]').clear().type('wrongpassword')
    cy.get('[data-cy=terms-consent]').check({ force: true })
    cy.get('[data-cy=login-submit]').click()

    cy.get('[data-cy="error-message"]', { timeout: 10000 }).should('contain.text', 'E-Mail oder Passwort ungültig.')
  })
})
