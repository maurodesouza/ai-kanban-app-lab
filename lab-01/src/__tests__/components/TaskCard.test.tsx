import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '@/components/molecules/Task/TaskCard';
import { Task, TaskStatus } from '@/types/task';
import { useKeyboardDragDrop } from '@/hooks/use-keyboard-drag-drop';
import { useSortable } from '@dnd-kit/sortable';
import { vi } from 'vitest';

// Mock the hooks
vi.mock('@/hooks/use-keyboard-drag-drop');
vi.mock('@dnd-kit/sortable');
vi.mock('@/components/handles/dragHandles');

const mockUseKeyboardDragDrop = vi.mocked(useKeyboardDragDrop);
const mockUseSortable = vi.mocked(useSortable);

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

  const mockKeyboardDragState = {
    selectedTaskId: null,
    targetColumn: null,
    isActive: false,
  };

  const mockSortableReturn = {
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
    active: null,
    activeIndex: -1,
    data: { id: '1' },
    rect: { current: null },
    index: 0,
    over: null,
    overIndex: -1,
    sortableNode: null,
    newIndex: -1,
    items: [],
    isOver: false,
    isSorting: false,
    disabled: false,
    strategy: null,
  } as any;

  beforeEach(() => {
    mockUseKeyboardDragDrop.mockReturnValue({
      state: mockKeyboardDragState,
      startKeyboardDrag: vi.fn(),
      cancelKeyboardDrag: vi.fn(),
    });

    mockUseSortable.mockReturnValue(mockSortableReturn);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Root', () => {
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
      expect(screen.getByText('10/04/2025')).toBeInTheDocument();
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

    it('applies dragging styles when isDragging is true', () => {
      mockUseSortable.mockReturnValue({
        ...mockSortableReturn,
        isDragging: true,
      });

      render(<TaskCard.Root task={mockTask} />);
      const article = screen.getByRole('article');
      expect(article).toHaveClass('shadow-xl', 'rotate-2', 'scale-105');
    });

    it('shows keyboard drag indicator when task is selected', () => {
      mockUseKeyboardDragDrop.mockReturnValue({
        state: { ...mockKeyboardDragState, selectedTaskId: '1' },
        startKeyboardDrag: vi.fn(),
        cancelKeyboardDrag: vi.fn(),
      });

      render(<TaskCard.Root task={mockTask} />);
      expect(screen.getByText('Keyboard Drag Active')).toBeInTheDocument();
    });

    it('highlights target column when keyboard drag is active', () => {
      mockUseKeyboardDragDrop.mockReturnValue({
        state: { 
          ...mockKeyboardDragState, 
          isActive: true, 
          targetColumn: 'todo' 
        },
        startKeyboardDrag: vi.fn(),
        cancelKeyboardDrag: vi.fn(),
      });

      render(<TaskCard.Root task={mockTask} />);
      const article = screen.getByRole('article');
      expect(article).toHaveClass('ring-2', 'ring-tone-primary-500');
    });

    it('calls startKeyboardDrag when Space key is pressed', () => {
      const mockStartKeyboardDrag = vi.fn();
      mockUseKeyboardDragDrop.mockReturnValue({
        state: mockKeyboardDragState,
        startKeyboardDrag: mockStartKeyboardDrag,
        cancelKeyboardDrag: vi.fn(),
      });

      render(<TaskCard.Root task={mockTask} />);
      const article = screen.getByRole('article');
      
      fireEvent.keyDown(article, { key: ' ' });
      expect(mockStartKeyboardDrag).toHaveBeenCalledWith('1');
    });

    it('calls startKeyboardDrag when Enter key is pressed', () => {
      const mockStartKeyboardDrag = vi.fn();
      mockUseKeyboardDragDrop.mockReturnValue({
        state: mockKeyboardDragState,
        startKeyboardDrag: mockStartKeyboardDrag,
        cancelKeyboardDrag: vi.fn(),
      });

      render(<TaskCard.Root task={mockTask} />);
      const article = screen.getByRole('article');
      
      fireEvent.keyDown(article, { key: 'Enter' });
      expect(mockStartKeyboardDrag).toHaveBeenCalledWith('1');
    });

    it('does not call startKeyboardDrag when keyboard drag is already active', () => {
      const mockStartKeyboardDrag = vi.fn();
      mockUseKeyboardDragDrop.mockReturnValue({
        state: { ...mockKeyboardDragState, isActive: true },
        startKeyboardDrag: mockStartKeyboardDrag,
        cancelKeyboardDrag: vi.fn(),
      });

      render(<TaskCard.Root task={mockTask} />);
      const article = screen.getByRole('article');
      
      fireEvent.keyDown(article, { key: ' ' });
      expect(mockStartKeyboardDrag).not.toHaveBeenCalled();
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
  });

  describe('Title', () => {
    it('renders task title', () => {
      render(<TaskCard.Title task={mockTask} />);
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('has correct styling classes', () => {
      render(<TaskCard.Title task={mockTask} />);
      const title = screen.getByText('Test Task');
      expect(title).toHaveClass('font-medium', 'text-foreground', 'text-sm', 'sm:text-base');
    });
  });

  describe('Description', () => {
    it('renders task description', () => {
      render(<TaskCard.Description task={mockTask} />);
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('has correct styling classes', () => {
      render(<TaskCard.Description task={mockTask} />);
      const description = screen.getByText('Test Description');
      expect(description).toHaveClass('text-xs', 'sm:text-sm', 'text-foreground-min', 'mt-1', 'sm:mt-2', 'line-clamp-2');
    });
  });

  describe('DueDate', () => {
    it('renders formatted date', () => {
      render(<TaskCard.DueDate dueDate="2025-04-10" />);
      expect(screen.getByText('10/04/2025')).toBeInTheDocument();
    });

    it('shows overdue styling for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastDateString = pastDate.toISOString().split('T')[0];
      
      render(<TaskCard.DueDate dueDate={pastDateString} />);
      const dateElement = screen.getByText(/\d{2}\/\d{2}\/\d{4}/);
      expect(dateElement).toHaveClass('text-palette-danger');
    });

    it('does not show overdue styling for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      render(<TaskCard.DueDate dueDate={futureDateString} />);
      const dateElement = screen.getByText(/\d{2}\/\d{2}\/\d{4}/);
      expect(dateElement).not.toHaveClass('text-palette-danger');
    });

    it('does not show overdue styling for today', () => {
      const today = new Date().toISOString().split('T')[0];
      
      render(<TaskCard.DueDate dueDate={today} />);
      const dateElement = screen.getByText(/\d{2}\/\d{2}\/\d{4}/);
      expect(dateElement).not.toHaveClass('text-palette-danger');
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

    it('renders unknown status with default styling', () => {
      render(<TaskCard.StatusBadge status="unknown" />);
      const badge = screen.getByText('UNKNOWN');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
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
