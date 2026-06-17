// frontend/cypress/e2e/habit_management.cy.js
describe('Habit Management E2E Tests', () => {
  const testHabitName = 'E2E Test Habit';
  const updatedHabitName = 'Updated E2E Habit';
  const sadPathHabitName = '   '; // Empty name for sad path

  beforeEach(() => {
    // Assuming the app starts on a page where habits can be managed
    cy.visit('http://localhost:5173');
    // Clear any existing habits for a clean test run (optional, depends on API)
    // This would typically involve an API call to clear test data
    // For now, we'll just create and delete
  });

  // Test 1: Create a new habit (Critical Path - Normal Case)
  it('should successfully create a new habit', () => {
    cy.get('[data-cy="add-habit-button"]').click(); // Assuming a button to open the form
    cy.get('[data-cy="habit-name-input"]').type(testHabitName);
    cy.get('[data-cy="habit-description-input"]').type('This is a test habit created via Cypress.');
    cy.get('[data-cy="habit-category-input"]').type('Testing');
    cy.get('[data-cy="submit-habit-button"]').click();

    // Assert that the habit appears in the list
    cy.get('[data-cy="habit-list"]').should('contain', testHabitName);
    cy.contains('[data-cy="habit-item-name"]', testHabitName).should('be.visible');
  });

  // Test 2: Update an existing habit (Critical Path - Normal Case)
  it('should successfully update an existing habit', () => {
    // First, ensure a habit exists to update
    cy.get('[data-cy="add-habit-button"]').click();
    cy.get('[data-cy="habit-name-input"]').type('Habit to be updated');
    cy.get('[data-cy="submit-habit-button"]').click();
    cy.contains('[data-cy="habit-item-name"]', 'Habit to be updated')
      .parents('[data-cy^="habit-item-"]')
      .as('habitItem');

    cy.get('@habitItem').find('[data-cy="edit-habit-button"]').click(); // Assuming an edit button
    cy.get('[data-cy="habit-name-input"]').clear().type(updatedHabitName);
    cy.get('[data-cy="submit-habit-button"]').click();

    cy.get('[data-cy="habit-list"]').should('contain', updatedHabitName);
    cy.contains('[data-cy="habit-item-name"]', updatedHabitName).should('be.visible');
    cy.contains('[data-cy="habit-item-name"]', 'Habit to be updated').should('not.exist');
  });

  // Test 3: Delete an existing habit (Critical Path - Normal Case)
  it('should successfully delete a habit', () => {
    // First, create a habit to delete
    cy.get('[data-cy="add-habit-button"]').click();
    cy.get('[data-cy="habit-name-input"]').type('Habit to be deleted');
    cy.get('[data-cy="submit-habit-button"]').click();
    cy.contains('[data-cy="habit-item-name"]', 'Habit to be deleted')
      .parents('[data-cy^="habit-item-"]')
      .as('habitItem');

    cy.get('@habitItem').find('[data-cy^="delete-button-"]').click();

    // Assert that the habit is no longer in the list
    cy.get('[data-cy="habit-list"]').should('not.contain', 'Habit to be deleted');
  });

  // Test 4: Attempt to create a habit without a name (Sad Path - Error Case)
  it('should display an error when trying to create a habit without a name', () => {
    cy.get('[data-cy="add-habit-button"]').click();
    cy.get('[data-cy="habit-name-input"]').type(sadPathHabitName); // Empty name
    cy.get('[data-cy="submit-habit-button"]').click();

    // Assert that an error message is displayed
    cy.get('[data-cy="habit-form-error"]').should('be.visible').and('contain', 'Name ist erforderlich.');
    // Assert that the habit is NOT added to the list
    cy.get('[data-cy="habit-list"]').should('not.contain', sadPathHabitName);
  });

  // Test 5: Check-in a habit (Critical Path - Normal Case)
  it('should successfully check-in a habit', () => {
    // First, create a habit to check-in
    cy.get('[data-cy="add-habit-button"]').click();
    cy.get('[data-cy="habit-name-input"]').type('Habit to check-in');
    cy.get('[data-cy="submit-habit-button"]').click();
    cy.contains('[data-cy="habit-item-name"]', 'Habit to check-in')
      .parents('[data-cy^="habit-item-"]')
      .as('habitItem');

    cy.get('@habitItem').find('[data-cy^="checkin-button-"]').click();

    // Assuming some visual feedback for check-in, e.g., a counter update or a class change
    // This part is highly dependent on the actual UI implementation.
    // For now, we'll just assert that the button is clicked and assume the backend processed it.
    // A more robust test would check for a visual change or an API call.
    cy.get('@habitItem').find('[data-cy^="checkin-button-"]').should('be.disabled'); // Example: button gets disabled
  });
});