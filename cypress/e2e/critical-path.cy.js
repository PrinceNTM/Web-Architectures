describe('Critical path - Login and create habit', () => {
    const base = 'http://localhost:5173';
    const uniqueSeed = `${Date.now()}-${Cypress._.random(1000, 9999)}`;
    const email = `e2e+${uniqueSeed}@example.com`;
    const password = `StrongPass!${uniqueSeed}`;
    const habitName = 'Cypress Habit';
    it('logs in, gets redirected, creates a habit and sees it in the list', () => {
        cy.visit(`${base}/login`);
        cy.get('[data-cy=login-email]').clear().type(email);
        cy.get('[data-cy=login-password]').clear().type(password);
        cy.get('[data-cy=login-submit]').click();
        // After login, should be redirected to home
        cy.location('pathname', { timeout: 10000 }).should('eq', '/');
        // Create a new habit
        cy.get('[data-cy=new-habit-input]').clear().type(habitName);
        cy.get('[data-cy=add-habit-btn]').click();
        // The habit should appear in the list
        cy.get('[data-cy=habit-name]').contains(habitName);
    });
});
