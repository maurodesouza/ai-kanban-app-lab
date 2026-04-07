# Data Model: Kanban Todo App

**Date**: 2025-04-07 | **Branch**: 001-kanban-todo-app

## Core Entities

### Task

The primary entity representing a work item in the kanban system.

```typescript
interface Task {
  id: string;                    // Unique identifier (UUID)
  title: string;                 // Required task title
  description?: string;          // Optional detailed description
  dueDate?: string;              // ISO date string (YYYY-MM-DD)
  status: TaskStatus;            // Current workflow status
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  order: number;                 // Position within column
}
```

### TaskStatus

Enum representing the three workflow states.

```typescript
enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress', 
  DONE = 'done'
}
```

### KanbanColumn

Represents a workflow column containing tasks.

```typescript
interface KanbanColumn {
  id: string;                    // Column identifier
  title: string;                 // Display title
  status: TaskStatus;            // Associated task status
  tasks: Task[];                 // Tasks in this column
  color?: string;                // Optional color theme
}
```

### FilterCriteria

Represents the current filter state.

```typescript
interface FilterCriteria {
  query: string;                 // Search query text
  active: boolean;               // Whether filter is applied
}
```

### ApplicationState

Global application state structure.

```typescript
interface ApplicationState {
  tasks: Task[];                  // All tasks
  columns: KanbanColumn[];       // Kanban columns
  filter: FilterCriteria;        // Current filter
  ui: UIState;                   // UI-specific state
}
```

### UIState

UI-specific state for modals and interactions.

```typescript
interface UIState {
  isTaskModalOpen: boolean;      // Task creation modal state
  selectedTaskId?: string;       // Currently selected task
  draggedTaskId?: string;        // Currently dragged task
  loading: boolean;              // Global loading state
  error?: string;                // Global error message
}
```

## Validation Rules

### Task Validation

Based on Zod schema for form validation.

```typescript
const TaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional()
});
```

### Validation Rules Summary

| Field | Required | Max Length | Format | Validation |
|-------|----------|------------|---------|------------|
| title | Yes | 100 chars | Plain text | Not empty, trimmed |
| description | No | 500 chars | Plain text | Optional |
| dueDate | No | N/A | YYYY-MM-DD | Valid date format |

## State Transitions

### Task Status Workflow

```
TODO -> IN_PROGRESS -> DONE
  ^         |           |
  |--------- v           v
  <----------- <---------
```

**Allowed Transitions**:
- TODO -> IN_PROGRESS
- IN_PROGRESS -> DONE
- DONE -> IN_PROGRESS
- IN_PROGRESS -> TODO
- TODO -> DONE (direct completion allowed)

**Transition Rules**:
- Tasks can move between any columns
- Order is maintained within each column
- Timestamps updated on status change
- Audit trail maintained via updatedAt field

## Data Relationships

### Task-Column Relationship

```
KanbanColumn (1) <-> (*) Task
- Column.status determines which tasks belong
- Task.order determines position within column
- Cascading delete: removing column removes associated tasks
```

### Task-Filter Relationship

```
FilterCriteria (1) -> (*) Task
- Filter applies to all tasks globally
- Filter affects visibility, not data
- No persistent relationship
```

## Performance Considerations

### Data Access Patterns

- **Read-heavy**: Frequent filtering and sorting operations
- **Write-light**: Task creation and status updates
- **Optimization**: Indexed access by task ID, memoized filtering

### Memory Management

- Task limit: 1000 tasks before virtual scrolling
- Cleanup: Remove completed tasks older than 30 days
- Compression: Compress large descriptions in storage

## Security Considerations

### Data Validation

- All user input validated before storage
- XSS prevention through proper escaping
- SQL injection not applicable (client-side only)

### Privacy

- No external data transmission
- No analytics or tracking

## Error Handling

### Validation Errors

- Form-level validation with user-friendly messages
- Real-time validation feedback
- Graceful degradation for invalid data

## Testing Data Model

### Test Fixtures

```typescript
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Test task",
    description: "Test description",
    dueDate: "2025-04-10",
    status: TaskStatus.TODO,
    createdAt: "2025-04-07T10:00:00Z",
    updatedAt: "2025-04-07T10:00:00Z",
    order: 0
  }
  // ... more test data
];
```

### Edge Cases

- Empty task lists
- Maximum length titles/descriptions
- Invalid date formats
- Duplicate task IDs

## Future Extensions

### Potential Enhancements

- Task dependencies
- Subtasks
- Labels/categories
- Assignees
- Comments
- Attachments
- Time tracking

### Schema Evolution

- Backward compatibility maintained
- Version-based migrations
- Feature flags for new functionality
