describe('Auth Sad Path - invalid login', () => {
  it('shows error message when credentials are invalid', () => {
    cy.visit('/login')

    cy.get('[data-cy=login-email]').clear().type('wrong@example.com')
    cy.get('[data-cy=login-password]').clear().type('wrongpassword')
    cy.get('[data-cy=terms-consent]').check({ force: true })
    cy.get('[data-cy=login-submit]').click()

    // Error message should appear
    cy.get('.error-message', { timeout: 10000 }).should('contain.text', 'E-Mail oder Passwort ungültig.')
  })
})
