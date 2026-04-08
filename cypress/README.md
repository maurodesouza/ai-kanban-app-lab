# E2E Tests with Cypress

This directory contains end-to-end tests for the Kanban Todo App using Cypress.

## Setup

Cypress is already configured and installed in the project. The configuration files are:

- `cypress.config.ts` - Main Cypress configuration
- `cypress/support/e2e.ts` - Support file with global setup
- `cypress/support/commands.ts` - Custom Cypress commands

## Running Tests

### Interactive Mode
```bash
npm run test:e2e
```

### Headless Mode
```bash
npx cypress run
```

### Specific Test File
```bash
npx cypress run --spec "cypress/e2e/basic-functionality.cy.ts"
```

## Test Structure

### Current Test Files

1. **basic-functionality.cy.ts** - Core application functionality tests
   - Application loading
   - UI elements presence
   - Filtering functionality
   - Responsive design
   - Basic accessibility
   - Keyboard navigation

2. **kanban-user-stories.cy.ts** - Comprehensive user story tests
   - Task management (create, edit, delete)
   - Drag and drop functionality
   - Filtering and search
   - Keyboard navigation
   - Accessibility compliance
   - Responsive design
   - Performance testing
   - Error handling

## Test Coverage Areas

### User Stories Covered

1. **View and Manage Tasks**
   - Display all columns
   - Show existing tasks
   - Create new tasks
   - Edit existing tasks

2. **Drag and Drop Tasks**
   - Move between columns
   - Reorder within columns
   - Visual feedback

3. **Filter and Search Tasks**
   - Filter by title
   - Filter by description
   - Clear filters
   - Empty states

4. **Keyboard Navigation**
   - Tab navigation
   - Keyboard shortcuts
   - Keyboard drag and drop

5. **Accessibility**
   - ARIA labels and roles
   - Screen reader support
   - Color contrast
   - Keyboard-only navigation

6. **Responsive Design**
   - Mobile (375x667)
   - Tablet (768x1024)
   - Desktop (1280x720)

7. **Performance**
   - Load times
   - Large dataset handling
   - Memory leak prevention

8. **Error Handling**
   - Network errors
   - Error messages
   - Retry mechanisms

## Custom Commands

The test suite includes custom Cypress commands in `cypress/support/commands.ts`:

- `createTask(taskData)` - Create a new task
- `dragTask(fromColumn, toColumn)` - Drag task between columns
- `filterTasks(searchTerm)` - Filter tasks
- `verifyTaskInColumn(taskTitle, column)` - Verify task location
- `waitForTask(taskTitle)` - Wait for task to appear
- `testKeyboardNavigation()` - Test keyboard navigation
- `checkA11y()` - Run accessibility checks

## Writing New Tests

When adding new tests:

1. Use descriptive test names
2. Follow the existing pattern of `describe` and `it` blocks
3. Use custom commands when available
4. Include assertions for both positive and negative cases
5. Test across different viewports for responsive design
6. Include accessibility checks where relevant

### Example Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('should do something specific', () => {
    // Arrange
    cy.get('selector').should('be.visible');
    
    // Act
    cy.get('selector').click();
    
    // Assert
    cy.get('result-selector').should('contain.text', 'expected');
  });
});
```

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for elements** instead of using fixed timeouts
3. **Test user workflows**, not implementation details
4. **Include accessibility testing** in relevant tests
5. **Test across viewports** for responsive design
6. **Use custom commands** for repeated actions
7. **Clean up state** in beforeEach hooks

## Debugging

### Debug Mode
Add `.debug()` to any command to pause execution and open the debugger:
```typescript
cy.get('selector').debug();
```

### Logging
Use `cy.log()` to add custom logs to the test runner:
```typescript
cy.log('Custom message');
```

### Screenshots
Cypress automatically takes screenshots on failures. You can also take manual screenshots:
```typescript
cy.screenshot('test-screenshot-name');
```

## Continuous Integration

The tests are configured to run in headless mode, making them suitable for CI/CD pipelines. The `test:e2e` script can be used in CI environments.

## Troubleshooting

### Common Issues

1. **Tests failing to find elements**
   - Check if the application is fully loaded
   - Verify selectors are correct
   - Add proper waits

2. **Flaky tests**
   - Use proper waiting strategies
   - Avoid fixed timeouts
   - Check for race conditions

3. **Performance issues**
   - Use `cy.intercept()` to mock network requests
   - Optimize test data setup
   - Reduce unnecessary assertions

### Getting Help

- Check the [Cypress documentation](https://docs.cypress.io/)
- Review test logs for specific error messages
- Use the Cypress Test Runner for interactive debugging
