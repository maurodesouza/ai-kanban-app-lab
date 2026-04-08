import { render, screen } from '@testing-library/react';
import { TaskCard } from '@/components/molecules/Task/TaskCard';
import { Task, TaskStatus } from '@/types/task';
import { vi } from 'vitest';

// Mock the hooks
vi.mock('@/hooks/use-keyboard-drag-drop', () => ({
  useKeyboardDragDrop: () => ({
    state: {
      selectedTaskId: null,
      targetColumn: null,
      isActive: false,
    },
    startKeyboardDrag: vi.fn(),
    cancelKeyboardDrag: vi.fn(),
  }),
}));

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@/components/handles/dragHandles', () => ({
  useDragHandle: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    style: {},
    isDragging: false,
  }),
}));

describe('TaskCard', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    dueDate: '2025-04-10',
    status: TaskStatus.TODO,
    createdAt: '2025-04-07T10:00:00Z',
    updatedAt: '2025-04-07T10:00:00Z',
    order: 0,
  };

  it('renders task title', () => {
    render(<TaskCard.Root task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders task description when provided', () => {
    render(<TaskCard.Root task={mockTask} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders due date when provided', () => {
    render(<TaskCard.Root task={mockTask} />);
    expect(screen.getByText('09/04/2025')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    render(<TaskCard.Root task={taskWithoutDescription} />);
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('does not render due date when not provided', () => {
    const taskWithoutDueDate = { ...mockTask, dueDate: undefined };
    render(<TaskCard.Root task={taskWithoutDueDate} />);
    expect(screen.queryByText(/10\/04\/2025/)).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<TaskCard.Root task={mockTask} />);
    const article = screen.getByRole('article');
    
    expect(article).toHaveAttribute('aria-label', 'Task: Test Task');
    expect(article).toHaveAttribute('data-task-id', '1');
    expect(article).toHaveAttribute('data-task-status', 'todo');
  });

  it('applies custom className', () => {
    render(<TaskCard.Root task={mockTask} className="custom-class" />);
    const article = screen.getByRole('article');
    expect(article).toHaveClass('custom-class');
  });

  describe('Title', () => {
    it('renders task title', () => {
      render(<TaskCard.Title task={mockTask} />);
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  describe('Description', () => {
    it('renders task description', () => {
      render(<TaskCard.Description task={mockTask} />);
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  describe('DueDate', () => {
    it('renders formatted date', () => {
      render(<TaskCard.DueDate dueDate="2025-04-10" />);
      expect(screen.getByText('09/04/2025')).toBeInTheDocument();
    });
  });

  describe('StatusBadge', () => {
    it('renders TODO status correctly', () => {
      render(<TaskCard.StatusBadge status="todo" />);
      const badge = screen.getByText('TODO');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('renders IN_PROGRESS status correctly', () => {
      render(<TaskCard.StatusBadge status="in_progress" />);
      const badge = screen.getByText('IN PROGRESS');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('renders DONE status correctly', () => {
      render(<TaskCard.StatusBadge status="done" />);
      const badge = screen.getByText('DONE');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  describe('Component export', () => {
    it('exports all subcomponents', () => {
      expect(TaskCard.Root).toBeDefined();
      expect(TaskCard.Title).toBeDefined();
      expect(TaskCard.Description).toBeDefined();
      expect(TaskCard.DueDate).toBeDefined();
      expect(TaskCard.StatusBadge).toBeDefined();
    });
  });
});
