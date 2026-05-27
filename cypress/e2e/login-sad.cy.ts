describe('Login Sad Path - invalid credentials', () => {
  const base = 'http://localhost:5173'

  it('shows generic error for existing email + wrong password', () => {
    cy.visit(`${base}/login`)

    // existing email but wrong password
    cy.get('[data-cy=login-email]').clear().type('e2e+test@example.com')
    cy.get('[data-cy=login-password]').clear().type('wrongpassword')
    cy.get('[data-cy=login-submit]').click()

    cy.get('[data-cy="error-message"]', { timeout: 10000 }).should('contain.text', 'E-Mail oder Passwort ungültig.')
  })
})
