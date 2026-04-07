import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TaskHandleEvents } from '@/events/handles/task';
import { events } from '@/events';
import { ModalsEnum } from '@/types/events';
import { TaskStatus } from '@/types/task';
import { TaskForm } from '@/components/molecules/Form/TaskForm';
import { TaskCard } from '@/components/molecules/Task/TaskCard';

// Mock the events
const mockEvents = {
  modal: {
    open: vi.fn(),
    close: vi.fn(),
  },
  task: {
    create: vi.fn(),
  },
};

// Mock the events module
vi.mock('@/events', () => ({
  events: mockEvents,
}));

// Mock TaskHandleEvents
vi.mock('@/events/handles/task', () => ({
  TaskHandleEvents: {
    create: vi.fn(),
    onTaskCreate: vi.fn(),
    offTaskCreate: vi.fn(),
  },
}));

describe('Task Creation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Task Form Integration', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      
      render(<TaskForm.Component />);

      // Fill in the form
      const titleInput = screen.getByLabelText(/título/i);
      const descriptionInput = screen.getByLabelText(/descrição/i);
      const submitButton = screen.getByRole('button', { name: /criar tarefa/i });

      await user.type(titleInput, 'Test Task');
      await user.type(descriptionInput, 'Test Description');
      
      // Submit the form
      await user.click(submitButton);

      // Verify task creation event was called
      await waitFor(() => {
        expect(TaskHandleEvents.create).toHaveBeenCalledWith({
          title: 'Test Task',
          description: 'Test Description',
          dueDate: '',
          status: 'todo',
        });
      });

      // Verify modal was closed
      expect(mockEvents.modal.close).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      
      render(<TaskForm.Component />);

      const submitButton = screen.getByRole('button', { name: /criar tarefa/i });
      
      // Try to submit without filling required fields
      await user.click(submitButton);

      // Should show validation error for title
      await waitFor(() => {
        expect(screen.getByText(/o título é obrigatório/i)).toBeInTheDocument();
      });

      // Task creation should not be called
      expect(TaskHandleEvents.create).not.toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock TaskHandleEvents.create to delay
      TaskHandleEvents.create = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<TaskForm.Component />);

      const titleInput = screen.getByLabelText(/título/i);
      const submitButton = screen.getByRole('button', { name: /criar tarefa/i });

      await user.type(titleInput, 'Test Task');
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText(/criando\.\.\./i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Task Card Display', () => {
    it('should display task information correctly', () => {
      const task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: '2024-12-31',
        status: TaskStatus.TODO,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        order: 1,
      };

      render(<TaskCard.Root task={task} />);

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('31/12/2024')).toBeInTheDocument();
    });

    it('should handle tasks without description', () => {
      const task = {
        id: '1',
        title: 'Test Task',
        status: TaskStatus.TODO,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        order: 1,
      };

      render(<TaskCard.Root task={task} />);

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    });

    it('should handle tasks without due date', () => {
      const task = {
        id: '1',
        title: 'Test Task',
        status: TaskStatus.TODO,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        order: 1,
      };

      render(<TaskCard.Root task={task} />);

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.queryByText(/\d{2}\/\d{2}\/\d{4}/)).not.toBeInTheDocument();
    });
  });

  describe('Modal Integration', () => {
    it('should open modal when task creation is triggered', () => {
      // Simulate modal open event
      const modalOpenEvent = new CustomEvent('modal.open', {
        detail: { modal: ModalsEnum.TASK }
      });

      document.dispatchEvent(modalOpenEvent);

      // Verify modal open was called
      expect(mockEvents.modal.open).toHaveBeenCalledWith({
        modal: ModalsEnum.TASK
      });
    });

    it('should close modal when task is created', async () => {
      const user = userEvent.setup();
      
      render(<TaskForm.Component />);

      const titleInput = screen.getByLabelText(/título/i);
      const submitButton = screen.getByRole('button', { name: /criar tarefa/i });

      await user.type(titleInput, 'Test Task');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockEvents.modal.close).toHaveBeenCalled();
      });
    });
  });

  describe('End-to-End Task Creation Flow', () => {
    it('should complete full task creation flow', async () => {
      const user = userEvent.setup();
      
      // 1. Open modal
      events.modal.open({ modal: ModalsEnum.TASK });

      // 2. Fill form
      render(<TaskForm.Component />);
      
      const titleInput = screen.getByLabelText(/título/i);
      const descriptionInput = screen.getByLabelText(/descrição/i);
      const submitButton = screen.getByRole('button', { name: /criar tarefa/i });

      await user.type(titleInput, 'New Task');
      await user.type(descriptionInput, 'Task Description');
      
      // 3. Submit form
      await user.click(submitButton);

      // 4. Verify task creation
      await waitFor(() => {
        expect(TaskHandleEvents.create).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'Task Description',
          dueDate: '',
          status: 'todo',
        });
      });

      // 5. Verify modal closed
      expect(mockEvents.modal.close).toHaveBeenCalled();

      // 6. Verify task would appear in TODO column (simulated)
      const createdTask = {
        id: expect.any(String),
        title: 'New Task',
        description: 'Task Description',
        status: 'todo',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        order: expect.any(Number),
      };

      // This would be verified in the actual Kanban component
      expect(TaskHandleEvents.create).toHaveBeenCalledWith(
        expect.objectContaining(createdTask)
      );
    });
  });
});
