# Quickstart Guide: Kanban Todo App

**Branch**: 001-kanban-todo-app | **Date**: 2025-04-07

## Project Overview

A mobile-first kanban todo application built with Next.js 15+, TypeScript, and TailwindCSS. Features drag-and-drop task management, filtering, and comprehensive accessibility support.

## Technology Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS 4.x with CSS tokens
- **UI Components**: ShadCN
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library + Cypress
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+ 
- pnpm 8+
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd ai-todo-app-lab
git checkout 001-kanban-todo-app
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment variables
cp .env.example .env.local

# No additional configuration required for local development
```

### 3. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## Development Workflow

### Code Quality Tools

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check

# Run all quality checks
pnpm check
```

### Testing

```bash
# Unit tests
pnpm test

# Integration tests  
pnpm test:integration

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:coverage
```

### Build and Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Export static files (if needed)
pnpm export
```

## Project Structure

```
cypress/
|-- e2e/                         # End-to-end tests (Cypress)

public/                          # Static assets

src/
|-- app/
|   |-- layout.tsx               # Root layout (mount handlers here)
|   |-- page.tsx                 # Main application page
|
|-- styles/
|   |-- globals.css              # Global styles and CSS tokens
|   |-- themes/                  # Theme definitions (token values)
|   |   |-- index.css
|   |   |-- dark.css
|   |   |-- light.css
|
|-- components/
|   |-- handles/                 # Event listeners (connect events → stores)
|   |-- atoms/                   # Smallest UI components (buttons, inputs)
|   |-- molecules/               # Composed components (form groups, cards)
|   |-- organisms/               # Feature-level components (kanban, task, etc)
|   |-- templates/               # Layout structures (page sections)
|
|-- events/
|   |-- index.ts                 # Event bus (on/off)
|   |-- handles/                 # Event emitters (public actions)
|   |   |-- index.ts
|   |   |-- base.ts              # BaseEventHandle (emit abstraction)
|   |   |-- modal.ts             # Modal events (open/close)
|   |   |-- task.ts              # Task events (create/update/delete)
|
|-- stores/                       # Custom React hooks
|   |-- kanban.ts
|
|-- hooks/                       # Custom React hooks
|   |-- use-tasks.ts
|   |-- use-filter.ts
|
|-- utils/
|   |-- tailwind/
|   |   |-- index.ts             # cn, twx, token helpers
|   |-- validation/
|   |   |-- index.ts             # Zod schemas
|
|-- types/
|   |-- task.ts                  # Task types
|   |-- events.ts                # Event enum/types
```

## Key Features

### 1. Kanban Board

Three columns (TODO, IN PROGRESS, DONE) with drag-and-drop task management.

### 2. Task Management

- Create tasks with title, description, and due date
- Edit existing tasks
- Delete tasks
- Automatic status updates via drag-and-drop

### 3. Filtering

Real-time filtering of tasks by title and description.

### 4. Mobile-First Design

- Responsive layout optimized for mobile devices
- Touch-friendly interactions
- Horizontal scrolling on mobile

### 5. Accessibility

- Full keyboard navigation
- Screen reader support
- WCAG AA compliance
- High contrast mode support

## Component Usage

### TaskCard Component

```typescript
import { Task } from '@/components/task';

<Task.Card 
  task={task}
  isDragging={isDragging}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  onClick={handleTaskClick}
/>
```

### KanbanColumn Component

```typescript
import { Kanban } from '@/components/kanban';

<Kanban.Column
  title="TODO"
  tasks={todoTasks}
  status="todo"
  onDrop={handleDrop}
  isEmpty={todoTasks.length === 0}
/>
```

### TaskModal Component

```typescript
import { Task } from '@/components/task';

<Task.Modal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  onSubmit={handleSubmitTask}
  mode="create"
/>
```

## Event System

### Task Events

```typescript
// Create task
events.kamban.task.create({
  title,
  description,
  dueDate
});

// Update task status
events.kamban.task.update({
  taskId: 'task-id',
  status: 'in_progress'
});
```

### UI Events

```typescript
// Open modal
events.modal.open({
  modal: ModalsEnum.TASK
});

// Apply filter
events.kamban.filter.update({
  query: 'search text'
});
```

## Styling Guidelines

### Using CSS Tokens

```typescript
import { cn, getThemeToken } from '@/utils/tailwind';

const TaskCard = twx.div`
  bg-background-base
  border border-ring-inner
  rounded-md
  p-4
  transition-colors
`;

// Dynamic theming
const cardColor = getThemeToken('--color-tone-contrast-100');
```

### Component Composition

```typescript
export const Task = {
  Container: TaskContainer,
  Title: TaskTitle,
  ...
};
```

## Testing Guidelines

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { Task } from '@/components/task';

describe('TaskCard', () => {
  it('renders task title', () => {
    const task = { id: '1', title: 'Test Task', status: 'todo' };
    render(<Task.Card task={task} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
import { cy } from 'cypress';

describe('Kanban Board', () => {
  it('should create and move task', () => {
    cy.visit('/');
    cy.get('[data-testid="add-task-btn"]').click();
    cy.get('[data-testid="task-title"]').type('New Task');
    cy.get('[data-testid="submit-btn"]').click();
    cy.get('[data-testid="task-card"]').drag('[data-testid="in-progress-column"]');
  });
});
```

## Performance Optimization

### Bundle Size

- Code splitting by route
- Dynamic imports for heavy components
- Tree shaking for unused dependencies

### Runtime Performance

- React.memo for expensive components
- useMemo for expensive calculations
- Debounced filtering
- Virtual scrolling for large lists

### Monitoring

- Core Web Vitals tracking
- Performance budget enforcement
- Bundle analysis with webpack-bundle-analyzer

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Static Export

```bash
# Next.js static export
pnpm build
pnpm export
```

## Troubleshooting

### Common Issues

1. **Drag and drop not working on mobile**
   - Ensure @dnd-kit sensors are configured
   - Check touch event handling

2. **Styles not applying**
   - Verify TailwindCSS configuration
   - Check CSS token imports

3. **Local storage errors**
   - Check browser storage quota
   - Verify storage permissions

### Debug Mode

```bash
# Enable debug logging
DEBUG=kanban:* pnpm dev

# Performance profiling
pnpm dev --profile
```

## Contributing

### Code Style

- Follow ESLint configuration
- Use Prettier for formatting
- Write TypeScript in strict mode

### Git Workflow

1. Create feature branch from `001-kanban-todo-app`
2. Make changes with proper commits
3. Run tests and quality checks
4. Submit pull request

### Review Checklist

- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Accessibility requirements met
- [ ] Performance budgets respected
- [ ] Documentation updated

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [@dnd-kit Documentation](https://dndkit.com/docs)
- [ShadCN Documentation](https://ui.shadcn.com)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)

## Support

For issues and questions:
1. Check existing documentation
2. Review test cases for usage examples
3. Create an issue with detailed description
4. Include reproduction steps and environment details
