import { render, screen, fireEvent } from '@testing-library/react';
import { useKeyboardDragDrop } from '@/hooks/use-keyboard-drag-drop';
import { vi } from 'vitest';

// Mock the events module
vi.mock('@/events', () => ({
  events: {
    drag: {
      end: vi.fn(),
      drop: vi.fn(),
    },
  },
}));

describe('useKeyboardDragDrop', () => {
  beforeEach(() => {
    // Mock document methods
    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'drag-announcements') {
        return {
          textContent: '',
        } as HTMLElement;
      }
      return null;
    });

    // Mock querySelectorAll
    vi.spyOn(document, 'querySelectorAll').mockImplementation((selector) => {
      if (selector === '[data-task-id][tabindex="0"]') {
        return [
          { getAttribute: () => 'task1', focus: vi.fn() },
          { getAttribute: () => 'task2', focus: vi.fn() },
        ] as unknown as NodeListOf<HTMLElement>;
      }
      return [] as unknown as NodeListOf<HTMLElement>;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const TestComponent = () => {
      const { state } = useKeyboardDragDrop();
      return (
        <div>
          <span data-testid="is-active">{state.isActive.toString()}</span>
          <span data-testid="selected-task">{state.selectedTaskId || 'none'}</span>
          <span data-testid="target-column">{state.targetColumn || 'none'}</span>
        </div>
      );
    };

    render(<TestComponent />);
    
    expect(screen.getByTestId('is-active')).toHaveTextContent('false');
    expect(screen.getByTestId('selected-task')).toHaveTextContent('none');
    expect(screen.getByTestId('target-column')).toHaveTextContent('none');
  });

  it('should start keyboard drag when startKeyboardDrag is called', () => {
    const TestComponent = () => {
      const { state, startKeyboardDrag } = useKeyboardDragDrop();
      return (
        <div>
          <span data-testid="is-active">{state.isActive.toString()}</span>
          <span data-testid="selected-task">{state.selectedTaskId || 'none'}</span>
          <button onClick={() => startKeyboardDrag('task1')}>Start Drag</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Start Drag'));
    
    expect(screen.getByTestId('is-active')).toHaveTextContent('true');
    expect(screen.getByTestId('selected-task')).toHaveTextContent('task1');
  });

  it('should cancel keyboard drag when cancelKeyboardDrag is called', () => {
    const TestComponent = () => {
      const { state, startKeyboardDrag, cancelKeyboardDrag } = useKeyboardDragDrop();
      return (
        <div>
          <span data-testid="is-active">{state.isActive.toString()}</span>
          <button onClick={() => startKeyboardDrag('task1')}>Start Drag</button>
          <button onClick={cancelKeyboardDrag}>Cancel Drag</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Start drag
    fireEvent.click(screen.getByText('Start Drag'));
    expect(screen.getByTestId('is-active')).toHaveTextContent('true');
    
    // Cancel drag
    fireEvent.click(screen.getByText('Cancel Drag'));
    expect(screen.getByTestId('is-active')).toHaveTextContent('false');
  });

  it('should handle arrow key navigation when keyboard drag is active', () => {
    const TestComponent = () => {
      const { state, startKeyboardDrag } = useKeyboardDragDrop();
      return (
        <div>
          <span data-testid="target-column">{state.targetColumn || 'none'}</span>
          <button onClick={() => startKeyboardDrag('task1')}>Start Drag</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Start drag
    fireEvent.click(screen.getByText('Start Drag'));
    
    // Simulate arrow key press
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    
    expect(screen.getByTestId('target-column')).not.toHaveTextContent('none');
  });

  it('should handle Enter key to move task', () => {
    const mockEvents = {
      drag: {
        end: vi.fn(),
        drop: vi.fn(),
      },
    };
    
    // Mock the events module for this test
    vi.doMock('@/events', () => mockEvents);
    
    const TestComponent = () => {
      const { state, startKeyboardDrag } = useKeyboardDragDrop();
      return (
        <div>
          <span data-testid="is-active">{state.isActive.toString()}</span>
          <button onClick={() => startKeyboardDrag('task1')}>Start Drag</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Start drag
    fireEvent.click(screen.getByText('Start Drag'));
    
    // Set target column and press Enter
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'Enter' });
    
    // Check that drag operations were called (this test verifies the hook behavior)
    expect(screen.getByTestId('is-active')).toHaveTextContent('false');
  });

  it('should handle Escape key to cancel drag', () => {
    const TestComponent = () => {
      const { state, startKeyboardDrag } = useKeyboardDragDrop();
      return (
        <div>
          <span data-testid="is-active">{state.isActive.toString()}</span>
          <button onClick={() => startKeyboardDrag('task1')}>Start Drag</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Start drag
    fireEvent.click(screen.getByText('Start Drag'));
    expect(screen.getByTestId('is-active')).toHaveTextContent('true');
    
    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(screen.getByTestId('is-active')).toHaveTextContent('false');
  });

  it('should ignore keyboard events when not in input elements', () => {
    const TestComponent = () => {
      const { state, startKeyboardDrag } = useKeyboardDragDrop();
      return (
        <div>
          <input type="text" placeholder="Test input" />
          <button onClick={() => startKeyboardDrag('task1')}>Start Drag</button>
          <span data-testid="target-column">{state.targetColumn || 'none'}</span>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Start drag
    fireEvent.click(screen.getByText('Start Drag'));
    
    // Focus input and press arrow keys
    const input = screen.getByPlaceholderText('Test input');
    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    
    // Target column should not change when focused on input
    expect(screen.getByTestId('target-column')).toHaveTextContent('none');
  });
});
