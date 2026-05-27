describe('Auth Sad Path - invalid login', () => {
  const base = 'http://localhost:5173'

  it('shows error message when credentials are invalid', () => {
    cy.visit(`${base}/login`)

    cy.get('[data-cy=login-email]').clear().type('wrong@example.com')
    cy.get('[data-cy=login-password]').clear().type('wrongpassword')
    cy.get('[data-cy=login-submit]').click()

    // Error message should appear
    cy.get('.error-message', { timeout: 10000 }).should('contain.text', 'E-Mail oder Passwort ungültig.')
  })
})
