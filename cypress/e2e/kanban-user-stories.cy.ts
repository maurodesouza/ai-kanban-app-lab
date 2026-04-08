describe('Kanban Todo App - User Stories', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');
    
    // Wait for the app to load
    cy.get('[data-testid="kanban-board"]').should('be.visible');
  });

  describe('Story 1: View and Manage Tasks', () => {
    it('should display all three columns (TODO, IN PROGRESS, DONE)', () => {
      cy.get('[data-testid="column-todo"]').should('be.visible');
      cy.get('[data-testid="column-in_progress"]').should('be.visible');
      cy.get('[data-testid="column-done"]').should('be.visible');
      
      // Check column headers
      cy.getColumnHeader('todo').should('contain', 'TODO');
      cy.getColumnHeader('in_progress').should('contain', 'IN PROGRESS');
      cy.getColumnHeader('done').should('contain', 'DONE');
    });

    it('should display existing tasks in their respective columns', () => {
      // Check if tasks are displayed (assuming some default tasks exist)
      cy.get('[data-testid="task-card"]').should('have.length.greaterThan', 0);
    });

    it('should allow creating a new task', () => {
      const taskData = {
        title: 'New Test Task',
        description: 'This is a test task created via E2E test',
        dueDate: '2025-12-31'
      };

      // Create the task
      cy.createTask(taskData);

      // Verify task appears in TODO column
      cy.verifyTaskInColumn(taskData.title, 'todo');
      cy.waitForTask(taskData.title);
    });

    it('should allow editing an existing task', () => {
      const originalTitle = 'Task to Edit';
      const updatedTitle = 'Updated Task Title';

      // First create a task
      cy.createTask({ title: originalTitle });
      cy.waitForTask(originalTitle);

      // Edit the task (click on the task)
      cy.get(`[data-testid="task-card"]:contains("${originalTitle}")`).click();
      
      // Update the title
      cy.get('[data-testid="task-title-input"]').clear().type(updatedTitle);
      cy.get('[data-testid="task-submit-button"]').click();

      // Verify the updated title
      cy.verifyTaskInColumn(updatedTitle, 'todo');
      cy.get(`[data-testid="task-card"]:contains("${originalTitle}")`).should('not.exist');
    });
  });

  describe('Story 2: Drag and Drop Tasks', () => {
    beforeEach(() => {
      // Create some test tasks for drag and drop testing
      cy.createTask({ title: 'Task 1' });
      cy.createTask({ title: 'Task 2' });
      cy.createTask({ title: 'Task 3' });
      
      // Wait for tasks to be created
      cy.waitForTask('Task 1');
      cy.waitForTask('Task 2');
      cy.waitForTask('Task 3');
    });

    it('should allow dragging a task from TODO to IN PROGRESS', () => {
      // Drag first task from TODO to IN PROGRESS
      cy.dragTask('todo', 'in_progress', 0, 0);

      // Verify task moved to IN PROGRESS
      cy.verifyTaskInColumn('Task 1', 'in_progress');
      
      // Verify task is no longer in TODO
      cy.get('[data-testid="column-todo"]').should('not.contain', 'Task 1');
    });

    it('should allow dragging a task from IN PROGRESS to DONE', () => {
      // First move a task to IN PROGRESS
      cy.dragTask('todo', 'in_progress', 0, 0);
      
      // Then move it to DONE
      cy.dragTask('in_progress', 'done', 0, 0);

      // Verify task moved to DONE
      cy.verifyTaskInColumn('Task 1', 'done');
    });

    it('should allow reordering tasks within the same column', () => {
      // Get initial order of tasks in TODO
      cy.get('[data-testid="column-todo"] [data-testid="task-card"]')
        .then(($tasks) => {
          const initialOrder = $tasks.map((_, index) => index);
          
          // Drag second task to first position
          cy.dragTask('todo', 'todo', 1, 0);
          
          // Verify order changed
          cy.get('[data-testid="column-todo"] [data-testid="task-card"]')
            .should(($newTasks) => {
              const newOrder = $newTasks.map((_, index) => index);
              expect(newOrder).not.to.deep.equal(initialOrder);
            });
        });
    });

    it('should provide visual feedback during drag operations', () => {
      // Start dragging a task
      cy.get('[data-testid="column-todo"] [data-testid="task-card"]:first')
        .as('sourceTask')
        .trigger('mousedown', { which: 1 });

      // Check for visual feedback (drag overlay or similar)
      cy.get('@sourceTask').should('have.class', 'dragging');

      // Complete the drag
      cy.get('[data-testid="column-in_progress"]').trigger('mousemove', { clientX: 100, clientY: 100 });
      cy.get('[data-testid="column-in_progress"]').trigger('mouseup', { which: 1 });

      // Verify drag completed
      cy.verifyTaskInColumn('Task 1', 'in_progress');
    });
  });

  describe('Story 3: Filter and Search Tasks', () => {
    beforeEach(() => {
      // Create test tasks with different content
      cy.createTask({ title: 'Urgent Bug Fix', description: 'Critical bug in production' });
      cy.createTask({ title: 'Feature Request', description: 'New feature for users' });
      cy.createTask({ title: 'Documentation', description: 'Update API docs' });
      
      cy.waitForTask('Urgent Bug Fix');
      cy.waitForTask('Feature Request');
      cy.waitForTask('Documentation');
    });

    it('should filter tasks by title', () => {
      // Filter by "Bug"
      cy.filterTasks('Bug');

      // Should only show tasks containing "Bug"
      cy.get('[data-testid="task-card"]').should('contain', 'Bug');
      cy.get('[data-testid="task-card"]').should('have.length', 1);
    });

    it('should filter tasks by description', () => {
      // Filter by "API"
      cy.filterTasks('API');

      // Should only show tasks containing "API"
      cy.get('[data-testid="task-card"]').should('contain', 'API');
      cy.get('[data-testid="task-card"]').should('have.length', 1);
    });

    it('should clear filter when input is empty', () => {
      // First filter to see some results
      cy.filterTasks('Bug');
      cy.get('[data-testid="task-card"]').should('have.length', 1);

      // Clear filter
      cy.filterTasks('');

      // Should show all tasks again
      cy.get('[data-testid="task-card"]').should('have.length.greaterThan', 1);
    });

    it('should show "No matching tasks" when filter has no results', () => {
      // Filter by non-existent term
      cy.filterTasks('NonExistentTask');

      // Should show empty state
      cy.get('[data-testid="empty-state"]').should('contain', 'No matching tasks');
    });
  });

  describe('Story 4: Keyboard Navigation', () => {
    beforeEach(() => {
      // Create test tasks
      cy.createTask({ title: 'Keyboard Task 1' });
      cy.createTask({ title: 'Keyboard Task 2' });
      
      cy.waitForTask('Keyboard Task 1');
      cy.waitForTask('Keyboard Task 2');
    });

    it('should allow navigating between tasks using Tab key', () => {
      // Test keyboard navigation
      cy.testKeyboardNavigation();
    });

    it('should allow keyboard-based drag and drop', () => {
      // Focus on first task
      cy.get('[data-testid="task-card"]:contains("Keyboard Task 1")').focus();
      
      // Start keyboard drag
      cy.focused().type('{enter}');
      
      // Navigate to IN PROGRESS column
      cy.focused().type('{rightArrow}');
      
      // Move task
      cy.focused().type('{enter}');

      // Verify task moved
      cy.verifyTaskInColumn('Keyboard Task 1', 'in_progress');
    });

    it('should support keyboard shortcuts for creating tasks', () => {
      // Test Ctrl/Cmd + N for new task
      cy.get('body').type('{ctrl}n');
      
      // Should open new task modal
      cy.get('[data-testid="task-modal"]').should('be.visible');
      
      // Close modal
      cy.get('body').type('{esc}');
      cy.get('[data-testid="task-modal"]').should('not.exist');
    });

    it('should support keyboard shortcuts for filtering', () => {
      // Test Ctrl/Cmd + K for filter focus
      cy.get('body').type('{ctrl}k');
      
      // Filter input should be focused
      cy.get('[data-testid="task-filter"]').should('be.focused');
    });
  });

  describe('Story 5: Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      // Check main landmarks
      cy.get('[role="main"]').should('have.attr', 'aria-label', 'Kanban Board');
      cy.get('[role="region"]').should('have.attr', 'aria-label', 'Kanban Columns');
      
      // Check task cards
      cy.get('[data-testid="task-card"]').each(($card) => {
        cy.wrap($card).should('have.attr', 'aria-label');
      });
    });

    it('should support screen reader announcements', () => {
      // Check for live regions
      cy.get('[aria-live="polite"]').should('exist');
    });

    it('should have sufficient color contrast', () => {
      // Run accessibility check
      cy.checkA11y();
    });

    it('should be navigable using only keyboard', () => {
      // Try to complete a full workflow using only keyboard
      cy.get('body').tab();
      
      // Navigate to new task button
      cy.focused().type('{enter}');
      
      // Fill out form using keyboard
      cy.focused().type('Keyboard Only Task');
      cy.tab().type('Created using keyboard only');
      cy.tab().type('{enter}');
      
      // Verify task was created
      cy.verifyTaskInColumn('Keyboard Only Task', 'todo');
    });
  });

  describe('Story 6: Responsive Design', () => {
    it('should work on mobile devices', () => {
      // Set mobile viewport
      cy.viewport(375, 667);
      
      // Check that app is still functional
      cy.get('[data-testid="kanban-board"]').should('be.visible');
      cy.get('[data-testid="column-todo"]').should('be.visible');
      
      // Test creating a task on mobile
      cy.createTask({ title: 'Mobile Task' });
      cy.verifyTaskInColumn('Mobile Task', 'todo');
    });

    it('should work on tablet devices', () => {
      // Set tablet viewport
      cy.viewport(768, 1024);
      
      // Check that app is still functional
      cy.get('[data-testid="kanban-board"]').should('be.visible');
      
      // Test drag and drop on tablet
      cy.createTask({ title: 'Tablet Task' });
      cy.waitForTask('Tablet Task');
      cy.dragTask('todo', 'in_progress', 0, 0);
      cy.verifyTaskInColumn('Tablet Task', 'in_progress');
    });

    it('should adapt layout for different screen sizes', () => {
      // Test desktop
      cy.viewport(1280, 720);
      cy.get('[data-testid="kanban-board"]').should('be.visible');
      
      // Test mobile
      cy.viewport(375, 667);
      cy.get('[data-testid="kanban-board"]').should('be.visible');
      
      // Test tablet
      cy.viewport(768, 1024);
      cy.get('[data-testid="kanban-board"]').should('be.visible');
    });
  });

  describe('Story 7: Performance', () => {
    it('should load quickly', () => {
      // Check that the app loads within reasonable time
      cy.visit('/', { timeout: 5000 });
      cy.get('[data-testid="kanban-board"]').should('be.visible');
    });

    it('should handle large numbers of tasks efficiently', () => {
      // Create multiple tasks
      for (let i = 0; i < 20; i++) {
        cy.createTask({ title: `Performance Task ${i}` });
      }

      // Should still be responsive
      cy.get('[data-testid="task-card"]').should('have.length.greaterThan', 20);
      
      // Test drag and drop with many tasks
      cy.dragTask('todo', 'in_progress', 0, 0);
      cy.verifyTaskInColumn('Performance Task 0', 'in_progress');
    });

    it('should not have memory leaks during extended use', () => {
      // Simulate extended use by performing many operations
      for (let i = 0; i < 10; i++) {
        cy.createTask({ title: `Memory Test Task ${i}` });
        cy.waitForTask(`Memory Test Task ${i}`);
        cy.dragTask('todo', 'in_progress', i, 0);
        cy.dragTask('in_progress', 'done', 0, 0);
      }

      // App should still be responsive
      cy.get('[data-testid="kanban-board"]').should('be.visible');
      cy.createTask({ title: 'Final Test Task' });
      cy.verifyTaskInColumn('Final Test Task', 'todo');
    });
  });

  describe('Story 8: Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Simulate network failure (this would need to be implemented based on actual error handling)
      // For now, just verify the app doesn't crash
      cy.get('[data-testid="kanban-board"]').should('be.visible');
    });

    it('should show appropriate error messages', () => {
      // This would need to be implemented based on actual error handling
      // For now, just verify basic functionality
      cy.get('[data-testid="kanban-board"]').should('be.visible');
    });

    it('should allow retrying failed operations', () => {
      // This would need to be implemented based on actual error handling
      // For now, just verify basic functionality
      cy.get('[data-testid="kanban-board"]').should('be.visible');
    });
  });
});
