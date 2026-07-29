describe('Critical path - check-in, edit, delete, profile save, logout', () => {
  const api = Cypress.env('apiUrl') || 'http://localhost:3000/api'
  const uniqueSeed = `${Date.now()}-${Cypress._.random(1000, 9999)}`
  const email = `e2e+${uniqueSeed}@example.com`
  const password = `StrongPass!${uniqueSeed}`
  const initialHabitName = `Habit-${uniqueSeed}`
  const updatedHabitName = `Habit-Updated-${uniqueSeed}`

  const loginViaUi = () => {
    cy.visit('/login')
    cy.get('[data-cy=login-email]').clear().type(email)
    cy.get('[data-cy=login-password]').clear().type(password)
    cy.get('[data-cy=login-submit]').click()
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard')
  }

  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: `${api}/auth/register`,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: { email, password },
      failOnStatusCode: false,
    })
  })

  it('covers check-in, edit, delete, profile save and logout', () => {
    loginViaUi()

    cy.get('[data-cy=new-habit-input]').clear().type(initialHabitName)
    cy.get('[data-cy=add-habit-btn]').click()

    cy.contains('[data-cy=habit-name]', initialHabitName)
      .closest('article')
      .as('createdHabit')

    cy.get('@createdHabit').find('[data-cy^=habit-check-]').click()
    cy.get('@createdHabit').find('[data-cy^=habit-check-]').should('have.class', 'checked')

    cy.get('@createdHabit').find('[data-cy^=habit-edit-]').click()
    cy.get('.habit-popout input[id^="habit-name-"]')
      .clear()
      .type(updatedHabitName)
    cy.get('[data-cy=habit-popout-save]').click()

    cy.contains('[data-cy=habit-name]', updatedHabitName).should('exist')

    cy.contains('[data-cy=habit-name]', updatedHabitName)
      .closest('article')
      .find('[data-cy^=habit-delete-]')
      .click()

    cy.contains('[data-cy=habit-name]', updatedHabitName).should('not.exist')

    cy.get('[data-cy=sidebar-open-profile]').click()
    cy.get('[data-cy=profile-first-name]').clear().type('Cypress')
    cy.get('[data-cy=profile-language]').select('English')
    cy.get('[data-cy=profile-save]').click()

    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard')
    cy.get('.profile-name').should('contain.text', 'Cypress')

    cy.get('[data-cy=sidebar-logout]').click()
    cy.location('pathname', { timeout: 10000 }).should('eq', '/')
  })
})
