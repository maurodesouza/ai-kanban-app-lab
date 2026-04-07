# UI Component Contracts

**Date**: 2025-04-07 | **Branch**: 001-kanban-todo-app

## Component Interface Contracts

### TaskCard Component

```typescript
interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onDragStart?: (taskId: string) => void;
  onDragEnd?: () => void;
  onClick?: (taskId: string) => void;
}

interface TaskCardRef {
  element: HTMLDivElement | null;
  getDataTransfer: () => DragData;
}
```

**Behavior Contract**:
- Must display task title prominently
- Must show due date if present
- Must show description if present and not truncated
- Must have 44px minimum touch target
- Must be draggable via @dnd-kit sensors
- Must announce content to screen readers

### KanbanColumn Component

```typescript
interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
  isEmpty?: boolean;
}

interface KanbanColumnRef {
  element: HTMLDivElement | null;
  isDropTarget: boolean;
}
```

**Behavior Contract**:
- Must display column title
- Must render all tasks in order
- Must accept drag operations
- Must provide visual feedback during drag
- Must handle empty state gracefully
- Must be scrollable on mobile devices

### TaskModal Component

```typescript
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskData) => void;
  initialTask?: Task;
  mode: 'create' | 'edit';
}

interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
}
```

**Behavior Contract**:
- Must open/close with animation
- Must validate form on submit
- Must focus first input on open
- Must trap focus within modal
- Must close on escape key
- Must have 44px minimum touch targets

### FilterInput Component

```typescript
interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

interface FilterInputRef {
  element: HTMLInputElement | null;
  focus: () => void;
  clear: () => void;
}
```

**Behavior Contract**:
- Must debounce input changes (default 300ms)
- Must show clear button when not empty
- Must maintain focus during filtering
- Must announce filter results to screen readers

## Event System Contracts

### Task Events

```typescript
// Task Creation
interface TaskCreateEvent {
  type: 'task:create';
  data: CreateTaskData;
  timestamp: string;
}

// Task Status Update
interface TaskUpdateEvent {
  type: 'task:update';
  taskId: string;
  data: Partial<Task>;
  timestamp: string;
}

// Task Deletion
interface TaskDeleteEvent {
  type: 'task:delete';
  taskId: string;
  timestamp: string;
}
```

### UI Events

```typescript
// Modal Control
interface ModalEvent {
  type: 'modal:open' | 'modal:close';
  modalType: 'task' | 'confirm';
  data?: any;
  timestamp: string;
}

// Filter Events
interface FilterEvent {
  type: 'filter:update';
  query: string;
  timestamp: string;
}

// Drag Events
interface DragEvent {
  type: 'drag:start' | 'drag:end' | 'drag:drop';
  taskId: string;
  sourceStatus: TaskStatus;
  targetStatus?: TaskStatus;
  timestamp: string;
}
```

## Data Access Contracts

### Storage Interface

```typescript
interface TaskStorage {
  saveTasks(tasks: Task[]): Promise<void>;
  loadTasks(): Promise<Task[]>;
  saveSettings(settings: AppSettings): Promise<void>;
  loadSettings(): Promise<AppSettings>;
  clear(): Promise<void>;
}
```

### Validation Interface

```typescript
interface TaskValidator {
  validateTask(data: unknown): CreateTaskData;
  validateTitle(title: unknown): string;
  validateDescription(description: unknown): string | undefined;
  validateDueDate(date: unknown): string | undefined;
}
```

### Event Handler Interface

```typescript
interface TaskEventHandler {
  handleTaskCreate(event: TaskCreateEvent): void;
  handleTaskUpdate(event: TaskUpdateEvent): void;
  handleTaskDelete(event: TaskDeleteEvent): void;
  handleDragDrop(event: DragEvent): void;
  handleFilter(event: FilterEvent): void;
}
```

## Performance Contracts

### Drag and Drop Performance

```typescript
interface DragPerformanceMetrics {
  dragStartLatency: number;      // < 50ms
  dragUpdateLatency: number;     // < 16ms (60fps)
  dropLatency: number;           // < 100ms
  animationFrameRate: number;    // > 55fps
}
```

### Filter Performance

```typescript
interface FilterPerformanceMetrics {
  filterLatency: number;         // < 100ms for 1000 tasks
  debounceDelay: number;         // 300ms
  renderLatency: number;        // < 16ms per frame
}
```

### Memory Contracts

```typescript
interface MemoryLimits {
  maxTasks: number;              // 1000 tasks
  maxDescriptionLength: number; // 500 characters
  maxLocalStorageSize: number;   // 5MB
  componentMemoryLimit: number;  // 50MB per component
}
```

## Accessibility Contracts

### Screen Reader Contracts

```typescript
interface ScreenReaderAnnouncements {
  taskCreated: string;           // "Task created: [title]"
  taskMoved: string;             // "Task moved from [source] to [target]"
  filterApplied: string;         // "Filter applied: [count] tasks found"
  noResults: string;             // "No tasks match your filter"
  dragStarted: string;           // "Started dragging [task title]"
  dragCompleted: string;         // "Moved [task title] to [column]"
}
```

### Keyboard Navigation Contracts

```typescript
interface KeyboardNavigation {
  tabOrder: string[];            // Logical tab sequence
  shortcuts: Record<string, () => void>;  // Keyboard shortcuts
  focusManagement: {
    trapFocus: boolean;         // Focus trapping in modals
    restoreFocus: boolean;       // Focus restoration on close
    announceFocus: boolean;     // Focus announcement
  };
}
```

### Contrast Contracts

```typescript
interface ContrastRequirements {
  textContrast: number;          // 4.5:1 minimum (WCAG AA)
  interactiveContrast: number;  // 3:1 minimum (WCAG AA)
  focusIndicator: string;       // 2px solid outline
  hoverStates: string;           // Distinct hover indication
}
```

## Error Handling Contracts

### Error Types

```typescript
interface ValidationError {
  type: 'validation';
  field: string;
  message: string;
  code: string;
}

interface StorageError {
  type: 'storage';
  operation: 'save' | 'load' | 'clear';
  message: string;
  recoverable: boolean;
}

interface NetworkError {
  type: 'network';
  operation: string;
  message: string;
  retryable: boolean;
}
```

### Error Recovery Contracts

```typescript
interface ErrorRecovery {
  canRecover: (error: AppError) => boolean;
  recover: (error: AppError) => Promise<void>;
  fallback: (error: AppError) => void;
  report: (error: AppError) => void;
}
```

## Testing Contracts

### Component Testing Contracts

```typescript
interface ComponentTestContract {
  render: () => void;
  interact: (action: string) => void;
  assert: (expectation: string) => void;
  accessibility: () => void;
  performance: () => PerformanceMetrics;
}
```

### Integration Testing Contracts

```typescript
interface IntegrationTestContract {
  setup: () => Promise<void>;
  execute: (scenario: string) => Promise<void>;
  verify: (outcome: string) => void;
  cleanup: () => Promise<void>;
}
```

## Browser Compatibility Contracts

### Supported Browsers

```typescript
interface BrowserSupport {
  chrome: '90+';                 // Minimum version
  firefox: '88+';                // Minimum version
  safari: '14+';                 // Minimum version
  edge: '90+';                   // Minimum version
  mobile: {
    ios: '14+';
    android: '10+';
  };
}
```

### Feature Detection

```typescript
interface FeatureDetection {
  dragAndDrop: boolean;
  localStorage: boolean;
  touchEvents: boolean;
  cssGrid: boolean;
  cssCustomProperties: boolean;
}
```
