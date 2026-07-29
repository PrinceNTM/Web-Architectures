describe('Login Sad Path - invalid credentials', () => {
  const api = Cypress.env('apiUrl') || 'http://localhost:3000/api'
  const uniqueSeed = `${Date.now()}-${Cypress._.random(1000, 9999)}`
  const email = `e2e+${uniqueSeed}@example.com`
  const password = `StrongPass!${uniqueSeed}`
  const wrongPassword = `WrongPass!${uniqueSeed}`

  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: `${api}/auth/register`,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: { email, password },
      failOnStatusCode: false,
    })
  })

  it('shows generic error for existing email + wrong password', () => {
    cy.visit('/login')

    // existing email but wrong password
    cy.get('[data-cy=login-email]').clear().type(email)
    cy.get('[data-cy=login-password]').clear().type(wrongPassword)
    cy.get('[data-cy=login-submit]').click()

    cy.get('[data-cy="error-message"]', { timeout: 10000 }).should('contain.text', 'E-Mail oder Passwort ungültig.')
  })
})
