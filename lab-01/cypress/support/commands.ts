// Custom commands for the Kanban Todo App

// Command to create a new task
Cypress.Commands.add('createTask', (taskData) => {
  cy.get('[data-testid="new-task-button"]').click();
  cy.get('[data-testid="task-title-input"]').type(taskData.title);
  if (taskData.description) {
    cy.get('[data-testid="task-description-input"]').type(taskData.description);
  }
  if (taskData.dueDate) {
    cy.get('[data-testid="task-due-date-input"]').type(taskData.dueDate);
  }
  cy.get('[data-testid="task-submit-button"]').click();
});

// Command to drag and drop a task
Cypress.Commands.add('dragTask', (fromColumn, toColumn, fromIndex = 0, toIndex = 0) => {
  const sourceSelector = `[data-testid="column-${fromColumn}"] [data-testid="task-card"]:eq(${fromIndex})`;
  const targetSelector = `[data-testid="column-${toColumn}"]`;
  
  cy.get(sourceSelector).as('source');
  cy.get(targetSelector).as('target');
  
  cy.get('@source').trigger('mousedown', { which: 1 });
  cy.get('@target').trigger('mousemove', { clientX: 100, clientY: 100 });
  cy.get('@target').trigger('mouseup', { which: 1 });
});

// Command to filter tasks
Cypress.Commands.add('filterTasks', (searchTerm) => {
  cy.get('[data-testid="task-filter"]').clear().type(searchTerm);
});

// Command to check task count in column
Cypress.Commands.add('getTaskCount', (column) => {
  return cy.get(`[data-testid="column-${column}"] [data-testid="task-card"]`).its('length');
});

// Command to wait for task to appear
Cypress.Commands.add('waitForTask', (taskTitle) => {
  cy.get(`[data-testid="task-card"]:contains("${taskTitle}")`, { timeout: 5000 }).should('be.visible');
});

// Command to check accessibility
Cypress.Commands.add('checkA11y', (context, options) => {
  cy.checkA11y(context, {
    includedImpacts: ['minor', 'moderate', 'serious', 'critical'],
    ...options,
  });
});

// Command to test keyboard navigation
Cypress.Commands.add('testKeyboardNavigation', () => {
  cy.get('body').tab();
  cy.focused().should('exist');
});

// Command to test keyboard drag and drop
Cypress.Commands.add('testKeyboardDragDrop', (taskTitle, targetColumn) => {
  cy.get(`[data-testid="task-card"]:contains("${taskTitle}")`).focus();
  cy.focused().type('{enter}');
  cy.get('body').type('{rightArrow}'.repeat(targetColumn === 'in_progress' ? 1 : targetColumn === 'done' ? 2 : 0));
  cy.get('body').type('{enter}');
});

// Command to verify task in column
Cypress.Commands.add('verifyTaskInColumn', (taskTitle, column) => {
  cy.get(`[data-testid="column-${column}"]`).within(() => {
    cy.get(`[data-testid="task-card"]:contains("${taskTitle}")`).should('exist');
  });
});

// Command to get column header
Cypress.Commands.add('getColumnHeader', (column) => {
  return cy.get(`[data-testid="column-${column}"] [data-testid="column-header"]`);
});

// Command to check if column is empty
Cypress.Commands.add('isColumnEmpty', (column) => {
  cy.get(`[data-testid="column-${column}"]`).then(($column) => {
    const taskCount = $column.find('[data-testid="task-card"]').length;
    expect(taskCount).to.equal(0);
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      createTask(taskData: { title: string; description?: string; dueDate?: string }): Chainable<Element>;
      dragTask(fromColumn: string, toColumn: string, fromIndex?: number, toIndex?: number): Chainable<Element>;
      filterTasks(searchTerm: string): Chainable<Element>;
      getTaskCount(column: string): Chainable<number>;
      waitForTask(taskTitle: string): Chainable<Element>;
      checkA11y(context?: string, options?: any): Chainable<Element>;
      testKeyboardNavigation(): Chainable<Element>;
      testKeyboardDragDrop(taskTitle: string, targetColumn: string): Chainable<Element>;
      verifyTaskInColumn(taskTitle: string, column: string): Chainable<Element>;
      getColumnHeader(column: string): Chainable<Element>;
      isColumnEmpty(column: string): Chainable<Element>;
    }
  }
}
