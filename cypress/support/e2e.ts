// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands or override existing commands
// Cypress.Commands.add('login', (email, password) => { ... })

// Add global beforeEach/afterEach hooks
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
  
  // Clear cookies before each test
  cy.clearCookies();
});

// Add accessibility testing commands
import '@cypress-a11y/axe';

// Add visual testing support if needed
// import '@percy/cypress';
