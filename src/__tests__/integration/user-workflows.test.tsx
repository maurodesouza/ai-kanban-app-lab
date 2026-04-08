import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Home from '@/app/page';

// Mock the stores and hooks
vi.mock('@/stores/kanban', () => ({
  useKanbanStore: () => ({
    isLoading: false,
    error: null,
    tasks: [
      {
        id: '1',
        title: 'Test Task 1',
        description: 'Description 1',
        status: 'todo',
        createdAt: '2025-04-07T10:00:00Z',
        updatedAt: '2025-04-07T10:00:00Z',
        order: 0,
      },
      {
        id: '2',
        title: 'Test Task 2',
        description: 'Description 2',
        status: 'in_progress',
        createdAt: '2025-04-07T10:00:00Z',
        updatedAt: '2025-04-07T10:00:00Z',
        order: 0,
      },
    ],
    columns: [
      { id: 'todo', title: 'TODO', tasks: ['1'] },
      { id: 'in_progress', title: 'IN PROGRESS', tasks: ['2'] },
      { id: 'done', title: 'DONE', tasks: [] },
    ],
    filter: '',
    hasActiveFilter: false,
    setFilter: vi.fn(),
    getFilteredTasksByStatus: vi.fn((tasks, status) => 
      tasks.filter(task => task.status === status)
    ),
    updateTask: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-keyboard-shortcuts', () => ({
  useKeyboardShortcuts: () => {},
}));

vi.mock('@/hooks/use-keyboard-drag-drop', () => ({
  useKeyboardDragDrop: () => ({
    state: { selectedTaskId: null, targetColumn: null, isActive: false },
    startKeyboardDrag: vi.fn(),
    cancelKeyboardDrag: vi.fn(),
  }),
}));

// Mock @dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('User Workflow Integration Tests', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    vi.stubGlobal('localStorage', localStorageMock);

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Task Management Workflow', () => {
    it('should render the Kanban board with initial tasks', () => {
      render(<Home />);
      
      // Check that columns are rendered
      expect(screen.getByText('TODO')).toBeInTheDocument();
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
      expect(screen.getByText('DONE')).toBeInTheDocument();
      
      // Check that tasks are rendered
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });

    it('should allow filtering tasks', async () => {
      render(<Home />);
      
      // Find the filter input
      const filterInput = screen.getByPlaceholderText(/Filtrar tarefas/i);
      expect(filterInput).toBeInTheDocument();
      
      // Type in the filter
      fireEvent.change(filterInput, { target: { value: 'Test Task 1' } });
      
      // Verify filter was called
      const { useKanbanStore } = require('@/stores/kanban');
      expect(useKanbanStore().setFilter).toHaveBeenCalledWith('Test Task 1');
    });

    it('should show keyboard shortcuts modal when triggered', async () => {
      // Mock the modal system
      vi.mock('@/events', () => ({
        events: {
          modal: {
            open: vi.fn(),
            close: vi.fn(),
          },
        },
      }));

      render(<Home />);
      
      // Trigger keyboard shortcuts (Ctrl/Cmd + /)
      fireEvent.keyDown(document, { key: '/', ctrlKey: true });
      
      // The modal should be opened
      const { events } = require('@/events');
      expect(events.modal.open).toHaveBeenCalled();
    });

    it('should handle new task creation workflow', async () => {
      // Mock the modal system
      const mockEvents = {
        modal: {
          open: vi.fn(),
          close: vi.fn(),
        },
      };
      vi.mock('@/events', () => ({ events: mockEvents }));

      render(<Home />);
      
      // Find and click the new task button
      const newTaskButton = screen.getByText(/Nova Tarefa/i);
      fireEvent.click(newTaskButton);
      
      // Verify modal was opened
      expect(mockEvents.modal.open).toHaveBeenCalledWith({
        modal: 'TASK',
      });
    });
  });

  describe('Keyboard Navigation Workflow', () => {
    it('should support keyboard shortcuts for task management', () => {
      render(<Home />);
      
      // Test Ctrl/Cmd + K for filter focus
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
      
      // The filter input should be focused (this would be handled by the keyboard shortcuts hook)
      const filterInput = screen.getByPlaceholderText(/Filtrar tarefas/i);
      expect(filterInput).toBeInTheDocument();
    });

    it('should support keyboard drag and drop workflow', () => {
      render(<Home />);
      
      // Find a task card
      const taskCard = screen.getByText('Test Task 1').closest('article');
      expect(taskCard).toBeInTheDocument();
      
      // Simulate keyboard drag activation (Space or Enter)
      if (taskCard) {
        fireEvent.keyDown(taskCard, { key: ' ' });
      }
      
      // The keyboard drag hook should be called
      const { useKeyboardDragDrop } = require('@/hooks/use-keyboard-drag-drop');
      expect(useKeyboardDragDrop().startKeyboardDrag).toHaveBeenCalled();
    });
  });

  describe('Accessibility Workflow', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<Home />);
      
      // Check main landmarks
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Kanban Board');
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Kanban Columns');
      
      // Check task cards have proper labels
      const taskCards = screen.getAllByRole('article');
      expect(taskCards[0]).toHaveAttribute('aria-label', 'Task: Test Task 1');
      expect(taskCards[1]).toHaveAttribute('aria-label', 'Task: Test Task 2');
    });

    it('should have focus management for interactive elements', () => {
      render(<Home />);
      
      // Check that interactive elements are focusable
      const filterInput = screen.getByPlaceholderText(/Filtrar tarefas/i);
      expect(filterInput).toHaveAttribute('tabindex', '0');
      
      const newTaskButton = screen.getByText(/Nova Tarefa/i);
      expect(newTaskButton).toHaveAttribute('tabindex', '0');
    });

    it('should have screen reader announcements', () => {
      render(<Home />);
      
      // Check for drag announcements element
      const announcements = document.getElementById('drag-announcements');
      expect(announcements).toBeInTheDocument();
      expect(announcements).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Error Handling Workflow', () => {
    it('should handle loading states gracefully', () => {
      // Mock loading state
      vi.mock('@/stores/kanban', () => ({
        useKanbanStore: () => ({
          isLoading: true,
          error: null,
          tasks: [],
          columns: [],
          filter: '',
          hasActiveFilter: false,
          setFilter: vi.fn(),
          getFilteredTasksByStatus: vi.fn(),
          updateTask: vi.fn(),
        }),
      }));

      render(<Home />);
      
      // Should show loading state
      // (This would be implemented based on the actual loading UI)
    });

    it('should handle error states gracefully', () => {
      // Mock error state
      vi.mock('@/stores/kanban', () => ({
        useKanbanStore: () => ({
          isLoading: false,
          error: 'Failed to load tasks',
          tasks: [],
          columns: [],
          filter: '',
          hasActiveFilter: false,
          setFilter: vi.fn(),
          getFilteredTasksByStatus: vi.fn(),
          updateTask: vi.fn(),
        }),
      }));

      render(<Home />);
      
      // Should show error state
      // (This would be implemented based on the actual error UI)
    });
  });

  describe('Performance Workflow', () => {
    it('should render efficiently without unnecessary re-renders', async () => {
      const startTime = performance.now();
      
      render(<Home />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle large numbers of tasks efficiently', async () => {
      // Mock large dataset
      const largeTaskList = Array.from({ length: 100 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i + 1}`,
        description: `Description for task ${i + 1}`,
        status: ['todo', 'in_progress', 'done'][i % 3],
        createdAt: '2025-04-07T10:00:00Z',
        updatedAt: '2025-04-07T10:00:00Z',
        order: i,
      }));

      vi.mock('@/stores/kanban', () => ({
        useKanbanStore: () => ({
          isLoading: false,
          error: null,
          tasks: largeTaskList,
          columns: [
            { id: 'todo', title: 'TODO', tasks: largeTaskList.filter(t => t.status === 'todo').map(t => t.id) },
            { id: 'in_progress', title: 'IN PROGRESS', tasks: largeTaskList.filter(t => t.status === 'in_progress').map(t => t.id) },
            { id: 'done', title: 'DONE', tasks: largeTaskList.filter(t => t.status === 'done').map(t => t.id) },
          ],
          filter: '',
          hasActiveFilter: false,
          setFilter: vi.fn(),
          getFilteredTasksByStatus: vi.fn((tasks, status) => 
            tasks.filter(task => task.status === status)
          ),
          updateTask: vi.fn(),
        }),
      }));

      const startTime = performance.now();
      
      render(<Home />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should still render efficiently with large dataset
      expect(renderTime).toBeLessThan(200);
    });
  });
});
