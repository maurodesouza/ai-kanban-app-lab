# Contributing to Kanban Todo App

Thank you for your interest in contributing to the Kanban Todo App! This guide will help you get started with contributing to this project.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Performance Guidelines](#performance-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Review Process](#code-review-process)

## Development Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git
- VS Code (recommended)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/your-username/ai-todo-app-lab.git
   cd ai-todo-app-lab
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Verify setup**
   ```bash
   npm run check    # Lint, type-check, format
   npm run test     # Run all tests
   ```

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

## Project Structure

```
src/
|-- app/                    # Next.js App Router
|-- components/            # React components
|   |-- atoms/             # Basic UI elements (Button, Input, etc.)
|   |-- molecules/         # Composite components (TaskCard, etc.)
|   |-- organisms/         # Complex components (Kanban, etc.)
|-- hooks/                 # Custom React hooks
|-- stores/                # State management (Zustand)
|-- events/                # Event system
|-- types/                 # TypeScript types
|-- test/                  # Test configuration
|-- __tests__/             # Test files
```

### Component Architecture

Follow atomic design principles:

- **Atoms**: Basic UI elements that can't be broken down further
- **Molecules**: Simple combinations of atoms
- **Organisms**: Complex combinations of molecules and atoms

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Types: `kebab-case.ts`
- Tests: `ComponentName.test.tsx` or `hook-name.test.tsx`

## Coding Standards

### TypeScript

```typescript
// Use explicit types
const user: User = { name: 'John', age: 30 };

// Use interfaces for object shapes
interface User {
  name: string;
  age: number;
}

// Use generics when appropriate
function identity<T>(arg: T): T {
  return arg;
}

// Prefer const assertions
const COLORS = ['red', 'green', 'blue'] as const;
```

### React Patterns

```typescript
// Functional components with hooks
const Component = ({ prop1, prop2 }: Props) => {
  const [state, setState] = useState(initialState);
  
  return <div>{prop1}</div>;
};

// Custom hooks
const useCustomHook = (param: string) => {
  const [value, setValue] = useState('');
  
  useEffect(() => {
    // Effect logic
  }, [param]);
  
  return { value, setValue };
};
```

### Component Exports

```typescript
// Always export as grouped objects
export const ComponentName = {
  Root,
  SubComponent,
  AnotherPart,
};

// Usage
<ComponentName.Root />
<ComponentName.SubComponent />
```

### Styling

```typescript
// Use tailwind-variants for components with variants
const buttonVariants = tv({
  base: 'px-4 py-2 rounded-lg',
  variants: {
    variant: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-200 text-gray-800',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

// Use twx for simple components
const SimpleComponent = twx.div`flex items-center justify-center`;
```

### State Management

```typescript
// Use Zustand for simple state
interface KanbanStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  tasks: [],
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    )
  })),
}));
```

## Testing Guidelines

### Unit Tests

```typescript
// Test component rendering
import { render, screen } from '@testing-library/react';
import { ComponentName } from '@/components/atoms/Component';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName.Root prop="value" />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    render(<ComponentName.Button onClick={handleClick} />);
    
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Hook Tests

```typescript
// Test custom hooks
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from '@/hooks/use-custom-hook';

describe('useCustomHook', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useCustomHook('test'));
    
    expect(result.current.value).toBe('');
  });

  it('updates state', () => {
    const { result } = renderHook(() => useCustomHook('test'));
    
    act(() => {
      result.current.setValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });
});
```

### Integration Tests

```typescript
// Test user workflows
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '@/app/page';

describe('Task Management Workflow', () => {
  it('allows creating and managing tasks', async () => {
    render(<Home />);
    
    // Create task
    fireEvent.click(screen.getByText('Nova Tarefa'));
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New Task' }
    });
    fireEvent.click(screen.getByText('Save'));
    
    // Verify task exists
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// Cypress E2E tests
describe('Task Management', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('creates a new task', () => {
    cy.get('[data-testid="new-task-button"]').click();
    cy.get('[data-testid="task-title-input"]').type('New Task');
    cy.get('[data-testid="task-submit-button"]').click();
    
    cy.get('[data-testid="task-card"]').should('contain', 'New Task');
  });
});
```

## Accessibility Guidelines

### WCAG Compliance

- **Level A**: Essential accessibility (100% required)
- **Level AA**: Standard support (100% required)
- **Level AAA**: Enhanced support (when possible)

### Implementation Guidelines

```typescript
// Use semantic HTML
const Component = () => (
  <main role="main" aria-label="Kanban Board">
    <section aria-label="Task Columns">
      <h2>TODO</h2>
      {/* Content */}
    </section>
  </main>
);

// Add proper ARIA attributes
const Button = ({ children, onClick, ariaLabel }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onClick();
      }
    }}
  >
    {children}
  </button>
);

// Manage focus
const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      const firstFocusable = document.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  return isOpen ? (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  ) : null;
};
```

### Testing Accessibility

```typescript
// Test keyboard navigation
it('supports keyboard navigation', () => {
  render(<Component />);
  
  // Tab through elements
  fireEvent.keyDown(document, { key: 'Tab' });
  expect(document.activeElement).toHaveAttribute('tabindex');
  
  // Test Enter key on buttons
  fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
  expect(handleClick).toHaveBeenCalled();
});

// Test ARIA attributes
it('has proper ARIA labels', () => {
  render(<Component />);
  
  expect(screen.getByRole('main')).toHaveAttribute('aria-label');
  expect(screen.getByRole('button')).toHaveAttribute('aria-label');
});
```

## Performance Guidelines

### Component Performance

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* complex rendering */}</div>;
});

// Use useMemo for expensive calculations
const Component = ({ items }) => {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);
  
  return <div>Total: {expensiveValue}</div>;
};

// Use useCallback for stable references
const Component = ({ onClick }) => {
  const handleClick = useCallback((event) => {
    onClick(event.target.value);
  }, [onClick]);
  
  return <button onClick={handleClick}>Click</button>;
};
```

### Bundle Optimization

```typescript
// Dynamic imports for code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});

// Lazy load images
const Image = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setIsLoaded(true)}
      style={{ opacity: isLoaded ? 1 : 0 }}
    />
  );
};
```

### Performance Testing

```typescript
// Test render performance
it('renders within performance budget', () => {
  const startTime = performance.now();
  
  render(<ComponentWithManyItems items={largeArray} />);
  
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  expect(renderTime).toBeLessThan(100); // 100ms budget
});
```

## Pull Request Process

### Before Creating PR

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Run quality checks**:
   ```bash
   npm run check
   npm run test
   npm run performance:check
   ```
4. **Update CHANGELOG.md** if applicable

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Accessibility
- [ ] WCAG compliance verified
- [ ] Keyboard navigation tested
- [ ] Screen reader tested

## Performance
- [ ] Performance budget respected
- [ ] No regressions introduced
- [ ] Bundle size optimized

## Screenshots
Add screenshots for UI changes

## Additional Notes
Any additional information
```

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Performance budget respected
- [ ] Accessibility compliance verified
- [ ] No breaking changes (or clearly documented)

## Code Review Process

### Reviewer Guidelines

1. **Functionality**: Does the code work as intended?
2. **Accessibility**: Is it accessible to all users?
3. **Performance**: Does it meet performance requirements?
4. **Code Quality**: Is the code clean and maintainable?
5. **Testing**: Are tests comprehensive and appropriate?
6. **Documentation**: Is documentation clear and accurate?

### Review Checklist

- [ ] Functionality is correct
- [ ] Code is readable and maintainable
- [ ] Tests are comprehensive
- [ ] Accessibility is implemented
- [ ] Performance is optimized
- [ ] Documentation is accurate
- [ ] No security vulnerabilities
- [ ] No breaking changes (or documented)

## Getting Help

### Resources
- [Project Documentation](./README.md)
- [Accessibility Guidelines](./docs/ACCESSIBILITY.md)
- [Performance Guidelines](./docs/PERFORMANCE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

### Contact
- Create an issue for bugs or questions
- Start a discussion for ideas or feedback
- Join our community discussions

## Recognition

Contributors will be recognized in:
- README.md contributors section
- CHANGELOG.md for significant contributions
- Annual contributor appreciation post

Thank you for contributing to making the Kanban Todo App more accessible, performant, and user-friendly!
