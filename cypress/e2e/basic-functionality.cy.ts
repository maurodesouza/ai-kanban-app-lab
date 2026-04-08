describe('Kanban Todo App - Basic E2E Tests', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');
    
    // Wait for the app to load
    cy.get('body').should('be.visible');
  });

  it('should load the application successfully', () => {
    // Check that the main elements are present
    cy.get('main').should('exist');
    cy.get('h1').should('contain.text', 'Kanban');
  });

  it('should display task columns', () => {
    // Check for column headers
    cy.get('h2').should('contain.text', 'TODO');
    cy.get('h2').should('contain.text', 'IN PROGRESS');
    cy.get('h2').should('contain.text', 'DONE');
  });

  it('should have a new task button', () => {
    // Look for new task button
    cy.get('button').should('contain.text', 'Nova Tarefa');
  });

  it('should have a filter input', () => {
    // Look for filter input
    cy.get('input[placeholder*="Filtrar"]').should('exist');
  });

  it('should allow filtering tasks', () => {
    // Type in the filter
    cy.get('input[placeholder*="Filtrar"]').type('test');
    
    // Verify the input has the value
    cy.get('input[placeholder*="Filtrar"]').should('have.value', 'test');
  });

  it('should clear filter when input is cleared', () => {
    // Type in the filter
    cy.get('input[placeholder*="Filtrar"]').type('test');
    
    // Clear the filter
    cy.get('input[placeholder*="Filtrar"]').clear();
    
    // Verify the input is empty
    cy.get('input[placeholder*="Filtrar"]').should('have.value', '');
  });

  it('should be responsive on mobile', () => {
    // Set mobile viewport
    cy.viewport(375, 667);
    
    // Check that app is still visible
    cy.get('main').should('be.visible');
    cy.get('h1').should('contain.text', 'Kanban');
  });

  it('should be responsive on tablet', () => {
    // Set tablet viewport
    cy.viewport(768, 1024);
    
    // Check that app is still visible
    cy.get('main').should('be.visible');
    cy.get('h1').should('contain.text', 'Kanban');
  });

  it('should work on desktop', () => {
    // Set desktop viewport
    cy.viewport(1280, 720);
    
    // Check that app is still visible
    cy.get('main').should('be.visible');
    cy.get('h1').should('contain.text', 'Kanban');
  });

  it('should have proper accessibility attributes', () => {
    // Check for main landmark
    cy.get('main').should('have.attr', 'role', 'main');
    
    // Check for ARIA labels
    cy.get('main').should('have.attr', 'aria-label');
  });

  it('should support keyboard navigation', () => {
    // Focus on the body and tab through elements
    cy.get('body').tab();
    
    // Check that something is focused
    cy.focused().should('exist');
  });

  it('should handle keyboard shortcuts', () => {
    // Test keyboard shortcut for filter (Ctrl+K)
    cy.get('body').type('{ctrl}k');
    
    // Filter should be focused (this depends on implementation)
    cy.get('input[placeholder*="Filtrar"]').should('be.focused');
  });

  it('should load quickly', () => {
    // Check that the app loads within reasonable time
    cy.visit('/', { timeout: 5000 });
    cy.get('main').should('be.visible');
  });

  it('should not break with rapid interactions', () => {
    // Perform rapid interactions
    for (let i = 0; i < 5; i++) {
      cy.get('input[placeholder*="Filtrar"]').type(`test${i}`);
      cy.get('input[placeholder*="Filtrar"]').clear();
    }
    
    // App should still be responsive
    cy.get('main').should('be.visible');
  });

  it('should handle empty states gracefully', () => {
    // Filter for non-existent content
    cy.get('input[placeholder*="Filtrar"]').type('nonexistenttask12345');
    
    // App should still be visible and not crash
    cy.get('main').should('be.visible');
  });

  it('should maintain state during viewport changes', () => {
    // Start with desktop
    cy.viewport(1280, 720);
    cy.get('main').should('be.visible');
    
    // Type something in filter
    cy.get('input[placeholder*="Filtrar"]').type('test');
    cy.get('input[placeholder*="Filtrar"]').should('have.value', 'test');
    
    // Change to mobile
    cy.viewport(375, 667);
    
    // Filter should still have the value
    cy.get('input[placeholder*="Filtrar"]').should('have.value', 'test');
    
    // Change back to desktop
    cy.viewport(1280, 720);
    
    // Filter should still have the value
    cy.get('input[placeholder*="Filtrar"]').should('have.value', 'test');
  });
});
